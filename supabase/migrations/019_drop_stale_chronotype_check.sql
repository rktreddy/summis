-- 019: Drop the stale chronotype check constraint from migration 008.
--
-- Migration 008 added `profiles_chronotype_check` allowing only
-- ('early', 'moderate', 'late'). Migration 013 added a second constraint
-- `profiles_chronotype_enum` with the same values, then migration 016
-- replaced `_enum` with the Summis values ('am_shifted', 'bi_phasic',
-- 'pm_shifted'). The `_check` constraint from 008 was never dropped, so
-- any write of the new Summis chronotypes fails in production.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_chronotype_check;
