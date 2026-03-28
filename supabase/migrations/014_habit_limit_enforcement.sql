-- 014_habit_limit_enforcement.sql
-- Server-side enforcement of the free-tier habit limit (5 active habits).
-- Two layers of defense:
--   1. RPC function for explicit create-with-check calls from the client
--   2. INSERT trigger as defense-in-depth (catches any direct inserts)

-- ── RPC: create_habit_with_limit_check ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_habit_with_limit_check(
  p_title text,
  p_description text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_science_note text DEFAULT NULL,
  p_target_time text DEFAULT NULL,
  p_color text DEFAULT NULL,
  p_icon text DEFAULT NULL,
  p_difficulty text DEFAULT 'moderate',
  p_trigger_cue text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tier text;
  v_active_count int;
  v_habit_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Serialize habit creation per user to prevent TOCTOU race condition
  -- (two concurrent inserts both seeing count=4 and both inserting)
  PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text));

  -- Get the user's subscription tier
  SELECT subscription_tier INTO v_tier
    FROM public.profiles
    WHERE id = v_user_id;

  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Count active habits
  SELECT count(*) INTO v_active_count
    FROM public.habits
    WHERE user_id = v_user_id AND is_active = true;

  -- Free tier: max 5 active habits
  IF v_tier = 'free' AND v_active_count >= 5 THEN
    RAISE EXCEPTION 'FREE_TIER_HABIT_LIMIT: Upgrade to Pro for unlimited habits';
  END IF;

  -- Insert the habit
  INSERT INTO public.habits (user_id, title, description, category, science_note, target_time, color, icon, difficulty, trigger_cue)
  VALUES (v_user_id, p_title, p_description, p_category, p_science_note, p_target_time, p_color, p_icon, p_difficulty, p_trigger_cue)
  RETURNING id INTO v_habit_id;

  RETURN v_habit_id;
END;
$$;

-- ── Defense-in-depth: INSERT trigger ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_habit_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_tier text;
  v_active_count int;
BEGIN
  -- Only enforce on active habits
  IF NEW.is_active = false THEN
    RETURN NEW;
  END IF;

  SELECT subscription_tier INTO v_tier
    FROM public.profiles
    WHERE id = NEW.user_id;

  -- Skip check for Pro/Lifetime users
  IF v_tier IN ('pro', 'lifetime') THEN
    RETURN NEW;
  END IF;

  -- Count existing active habits (excluding this new one)
  SELECT count(*) INTO v_active_count
    FROM public.habits
    WHERE user_id = NEW.user_id AND is_active = true;

  IF v_active_count >= 5 THEN
    RAISE EXCEPTION 'FREE_TIER_HABIT_LIMIT: Upgrade to Pro for unlimited habits';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_habit_limit
  BEFORE INSERT ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_habit_limit();
