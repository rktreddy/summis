-- Add text length constraints to new Summis tables (sprints, mits, hygiene)
-- Profiles constraints already exist from migration 013.

ALTER TABLE public.sprints
  ADD CONSTRAINT sprints_intention_length CHECK (char_length(intention) <= 500),
  ADD CONSTRAINT sprints_reflection_note_length CHECK (reflection_note IS NULL OR char_length(reflection_note) <= 500),
  ADD CONSTRAINT sprints_duration_range CHECK (duration_minutes >= 1 AND duration_minutes <= 120),
  ADD CONSTRAINT sprints_focus_quality_range CHECK (focus_quality IS NULL OR (focus_quality >= 1 AND focus_quality <= 5)),
  ADD CONSTRAINT sprints_intention_met_enum CHECK (intention_met IS NULL OR intention_met IN ('yes', 'partially', 'no'));

ALTER TABLE public.mits
  ADD CONSTRAINT mits_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT mits_estimated_range CHECK (estimated_minutes >= 1 AND estimated_minutes <= 480),
  ADD CONSTRAINT mits_sort_order_range CHECK (sort_order >= 1 AND sort_order <= 3);

ALTER TABLE public.hygiene_configs
  ADD CONSTRAINT hygiene_configs_label_length CHECK (char_length(label) <= 100),
  ADD CONSTRAINT hygiene_configs_description_length CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE public.hygiene_logs
  ADD CONSTRAINT hygiene_logs_practice_length CHECK (char_length(practice) <= 50);

-- Extend profiles chronotype enum to include new Summis chronotype values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_chronotype_enum;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_chronotype_enum CHECK (
    chronotype IS NULL OR chronotype IN ('early', 'moderate', 'late', 'am_shifted', 'bi_phasic', 'pm_shifted')
  );

-- Add constraint for new phone_placement_commitment column
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_placement_enum CHECK (
    phone_placement_commitment IS NULL OR phone_placement_commitment IN ('other_room', 'drawer', 'face_down')
  );
