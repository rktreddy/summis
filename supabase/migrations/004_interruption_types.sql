-- 004: Add interruption_types array to focus_sessions
alter table public.focus_sessions
  add column if not exists interruption_types text[] default '{}';

comment on column public.focus_sessions.interruption_types is 'Array of interruption types: phone, person, thought, other';
