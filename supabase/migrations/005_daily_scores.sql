-- 005: Daily scores table for correlation engine
create table public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  overall_score int,
  habit_score int,
  focus_score int,
  consistency_score int,
  computed_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_scores enable row level security;
create policy "Users own their daily scores"
  on public.daily_scores for all using (auth.uid() = user_id);
create index on public.daily_scores (user_id, date desc);
