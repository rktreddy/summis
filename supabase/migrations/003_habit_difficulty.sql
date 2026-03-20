-- 003: Add difficulty column to habits for weighted scoring
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'moderate';

ALTER TABLE public.habits
  ADD CONSTRAINT habits_difficulty_check CHECK (difficulty IN ('easy', 'moderate', 'hard'));

COMMENT ON COLUMN public.habits.difficulty IS 'Habit difficulty: easy (0.5x), moderate (1x), hard (1.5x) weight in scoring';
