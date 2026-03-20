-- 003: Add difficulty column to habits for weighted scoring
alter table public.habits
  add column if not exists difficulty text default 'moderate'
  check (difficulty in ('easy', 'moderate', 'hard'));

comment on column public.habits.difficulty is 'Habit difficulty: easy (0.5x), moderate (1x), hard (1.5x) weight in scoring';
