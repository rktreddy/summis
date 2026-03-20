-- 002: Add user_goal column to profiles for onboarding quiz
alter table public.profiles
  add column if not exists user_goal text;

comment on column public.profiles.user_goal is 'Selected goal from onboarding quiz: focus, sleep, fitness, general';
