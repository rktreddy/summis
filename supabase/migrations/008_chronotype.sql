-- 008: Add chronotype and wake_time to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wake_time time;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS chronotype text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_chronotype_check CHECK (chronotype IN ('early', 'moderate', 'late'));

COMMENT ON COLUMN public.profiles.wake_time IS 'Typical wake time, e.g. 07:00';
COMMENT ON COLUMN public.profiles.chronotype IS 'Chronotype: early (morning person), moderate, late (night owl)';
