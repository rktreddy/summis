-- 007: Add trigger_cue column to habits for implementation intentions
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS trigger_cue text;

COMMENT ON COLUMN public.habits.trigger_cue IS 'Implementation intention: "When X happens, I will do this habit"';
