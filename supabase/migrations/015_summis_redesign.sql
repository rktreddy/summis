-- Migration 006: Summis Redesign
-- New tables for sprints, MITs, cognitive hygiene configs and logs
-- Profile extensions for sprint preferences and hygiene setup

-- ── Sprints ──────────────────────────────────────────────────────────────

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  intention text not null,
  duration_minutes int not null default 45,
  phase text not null default 'intention' check (phase in ('intention', 'focus', 'rest', 'reflection')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  completed boolean default false,

  -- Pre-sprint hygiene
  phone_away boolean default false,
  dnd_enabled boolean default false,
  environment_ready boolean default false,

  -- Post-sprint reflection
  focus_quality int check (focus_quality is null or (focus_quality between 1 and 5)),
  intention_met text check (intention_met is null or intention_met in ('yes', 'partially', 'no')),
  reflection_note text,
  interruptions int default 0,
  interruption_types text[] default '{}',

  -- Linked MIT (forward reference, constraint added after mits table)
  mit_id uuid,

  created_at timestamptz default now()
);

alter table public.sprints enable row level security;

create policy "Users can select own sprints"
  on public.sprints for select using (auth.uid() = user_id);
create policy "Users can insert own sprints"
  on public.sprints for insert with check (auth.uid() = user_id);
create policy "Users can update own sprints"
  on public.sprints for update using (auth.uid() = user_id);
create policy "Users can delete own sprints"
  on public.sprints for delete using (auth.uid() = user_id);

create index idx_sprints_user_date on public.sprints (user_id, date desc);

-- ── MITs (Most Important Tasks) ──────────────────────────────────────

create table public.mits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  title text not null,
  estimated_minutes int not null default 30,
  actual_minutes int,
  completed boolean default false,
  completed_at timestamptz,
  sort_order int default 1 check (sort_order between 1 and 3),
  sprint_id uuid references public.sprints(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.mits enable row level security;

create policy "Users can select own mits"
  on public.mits for select using (auth.uid() = user_id);
create policy "Users can insert own mits"
  on public.mits for insert with check (auth.uid() = user_id);
create policy "Users can update own mits"
  on public.mits for update using (auth.uid() = user_id);
create policy "Users can delete own mits"
  on public.mits for delete using (auth.uid() = user_id);

create index idx_mits_user_date on public.mits (user_id, date desc);

-- Add foreign key from sprints to mits now that both tables exist
alter table public.sprints
  add constraint fk_sprints_mit_id
  foreign key (mit_id) references public.mits(id) on delete set null;

-- ── Hygiene Configs ──────────────────────────────────────────────────

create table public.hygiene_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  practice text not null,
  label text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, practice)
);

alter table public.hygiene_configs enable row level security;

create policy "Users can select own hygiene configs"
  on public.hygiene_configs for select using (auth.uid() = user_id);
create policy "Users can insert own hygiene configs"
  on public.hygiene_configs for insert with check (auth.uid() = user_id);
create policy "Users can update own hygiene configs"
  on public.hygiene_configs for update using (auth.uid() = user_id);
create policy "Users can delete own hygiene configs"
  on public.hygiene_configs for delete using (auth.uid() = user_id);

-- ── Hygiene Logs ─────────────────────────────────────────────────────

create table public.hygiene_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  practice text not null,
  date date not null,
  compliant boolean not null,
  sprint_id uuid references public.sprints(id) on delete set null,
  logged_at timestamptz default now(),
  unique(user_id, practice, date)
);

alter table public.hygiene_logs enable row level security;

create policy "Users can select own hygiene logs"
  on public.hygiene_logs for select using (auth.uid() = user_id);
create policy "Users can insert own hygiene logs"
  on public.hygiene_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own hygiene logs"
  on public.hygiene_logs for update using (auth.uid() = user_id);
create policy "Users can delete own hygiene logs"
  on public.hygiene_logs for delete using (auth.uid() = user_id);

create index idx_hygiene_logs_user_date on public.hygiene_logs (user_id, date desc);

-- ── Profile Extensions ───────────────────────────────────────────────

alter table public.profiles add column if not exists sprint_duration_preference int default 45;
alter table public.profiles add column if not exists peak_window_start time;
alter table public.profiles add column if not exists peak_window_end time;
alter table public.profiles add column if not exists afternoon_window_start time;
alter table public.profiles add column if not exists afternoon_window_end time;
alter table public.profiles add column if not exists daily_sprint_target int default 3;
alter table public.profiles add column if not exists phone_placement_commitment text;
alter table public.profiles add column if not exists notification_audit_completed boolean default false;
alter table public.profiles add column if not exists hygiene_setup_completed boolean default false;
