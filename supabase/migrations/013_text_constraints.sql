-- 013_text_constraints.sql
-- Add CHECK constraints on text columns to prevent oversized input
-- and enforce valid enum values at the database level.

-- ── Habits ──────────────────────────────────────────────────────────────

ALTER TABLE public.habits
  ADD CONSTRAINT habits_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT habits_description_length CHECK (description IS NULL OR char_length(description) <= 1000),
  ADD CONSTRAINT habits_science_note_length CHECK (science_note IS NULL OR char_length(science_note) <= 500),
  ADD CONSTRAINT habits_color_length CHECK (color IS NULL OR char_length(color) <= 20),
  ADD CONSTRAINT habits_icon_length CHECK (icon IS NULL OR char_length(icon) <= 50),
  ADD CONSTRAINT habits_trigger_cue_length CHECK (trigger_cue IS NULL OR char_length(trigger_cue) <= 200),
  ADD CONSTRAINT habits_category_enum CHECK (
    category IS NULL OR category IN ('focus', 'sleep', 'exercise', 'nutrition', 'mindfulness', 'recovery', 'general')
  ),
  ADD CONSTRAINT habits_difficulty_enum CHECK (
    difficulty IS NULL OR difficulty IN ('easy', 'moderate', 'hard')
  ),
  ADD CONSTRAINT habits_frequency_enum CHECK (
    frequency IN ('daily', 'weekdays', 'custom')
  );

-- ── Profiles ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 100),
  ADD CONSTRAINT profiles_subscription_tier_enum CHECK (
    subscription_tier IN ('free', 'pro', 'lifetime')
  ),
  ADD CONSTRAINT profiles_user_goal_enum CHECK (
    user_goal IS NULL OR user_goal IN ('focus', 'sleep', 'fitness', 'general')
  ),
  ADD CONSTRAINT profiles_chronotype_enum CHECK (
    chronotype IS NULL OR chronotype IN ('early', 'moderate', 'late')
  );

-- ── Journal Entries ─────────────────────────────────────────────────────

ALTER TABLE public.journal_entries
  ADD CONSTRAINT journal_content_length CHECK (char_length(content) <= 10000),
  ADD CONSTRAINT journal_mood_range CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  ADD CONSTRAINT journal_energy_range CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 5));

-- ── Focus Sessions ──────────────────────────────────────────────────────

ALTER TABLE public.focus_sessions
  ADD CONSTRAINT focus_notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000),
  ADD CONSTRAINT focus_duration_range CHECK (duration_minutes >= 0 AND duration_minutes <= 480),
  ADD CONSTRAINT focus_session_type_enum CHECK (
    session_type IN ('deep_work', 'study', 'creative', 'admin', 'practice')
  );

-- ── Habit Completions ───────────────────────────────────────────────────

ALTER TABLE public.habit_completions
  ADD CONSTRAINT completion_note_length CHECK (note IS NULL OR char_length(note) <= 500),
  ADD CONSTRAINT completion_quality_range CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5));

-- ── Daily Plans ─────────────────────────────────────────────────────────

ALTER TABLE public.daily_plans
  ADD CONSTRAINT daily_plan_review_notes_length CHECK (review_notes IS NULL OR char_length(review_notes) <= 2000),
  ADD CONSTRAINT daily_plan_rating_range CHECK (day_rating IS NULL OR (day_rating >= 1 AND day_rating <= 5));
