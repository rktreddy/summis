-- 1000x: Initial database schema
-- Run this in your Supabase SQL editor or via supabase db push

-- 1. Users (extended from Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  display_name text,
  timezone text default 'UTC',
  onboarding_completed boolean default false,
  subscription_tier text default 'free',
  created_at timestamptz default now()
);

-- 2. Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  science_note text,
  category text,
  frequency text default 'daily',
  target_time time,
  color text,
  icon text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. Habit completions
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  note text,
  quality_rating int check (quality_rating between 1 and 5)
);

-- 4. Journal entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  mood int check (mood between 1 and 5),
  energy_level int check (energy_level between 1 and 5),
  tags text[],
  created_at timestamptz default now()
);

-- 5. Focus sessions
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  duration_minutes int not null,
  session_type text default 'deep_work',
  completed boolean default false,
  interruptions int default 0,
  quality_rating int check (quality_rating between 1 and 5),
  notes text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- 6. Performance scores (computed weekly)
create table if not exists public.performance_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  overall_score int,
  habit_score int,
  focus_score int,
  consistency_score int,
  computed_at timestamptz default now(),
  unique(user_id, week_start)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.performance_scores enable row level security;

-- RLS Policies: users can only read/update/delete their own data
-- SELECT + UPDATE + DELETE
create policy "Users read their profiles" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update their profiles" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert their profiles" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users read their habits" on public.habits
  for select using (auth.uid() = user_id);
create policy "Users insert their habits" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "Users update their habits" on public.habits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their habits" on public.habits
  for delete using (auth.uid() = user_id);

create policy "Users read their habit completions" on public.habit_completions
  for select using (auth.uid() = user_id);
create policy "Users insert their habit completions" on public.habit_completions
  for insert with check (auth.uid() = user_id);
create policy "Users delete their habit completions" on public.habit_completions
  for delete using (auth.uid() = user_id);

create policy "Users read their journal entries" on public.journal_entries
  for select using (auth.uid() = user_id);
create policy "Users insert their journal entries" on public.journal_entries
  for insert with check (auth.uid() = user_id);
create policy "Users update their journal entries" on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their journal entries" on public.journal_entries
  for delete using (auth.uid() = user_id);

create policy "Users read their focus sessions" on public.focus_sessions
  for select using (auth.uid() = user_id);
create policy "Users insert their focus sessions" on public.focus_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users read their performance scores" on public.performance_scores
  for select using (auth.uid() = user_id);
create policy "Users insert their performance scores" on public.performance_scores
  for insert with check (auth.uid() = user_id);
create policy "Users update their performance scores" on public.performance_scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes for common queries
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habits_is_active on public.habits(is_active);
create index if not exists idx_habit_completions_habit_id on public.habit_completions(habit_id);
create index if not exists idx_habit_completions_user_completed on public.habit_completions(user_id, completed_at);
create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);
create index if not exists idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index if not exists idx_focus_sessions_completed on public.focus_sessions(completed);
create index if not exists idx_performance_scores_user_id on public.performance_scores(user_id);
