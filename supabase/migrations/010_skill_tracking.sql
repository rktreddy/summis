-- 010: Skill logs table for deliberate practice tracking
CREATE TABLE IF NOT EXISTS public.skill_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  weakness_targeted text,
  progress_rating int CHECK (progress_rating BETWEEN 1 AND 5),
  focus_session_id uuid REFERENCES public.focus_sessions(id),
  practiced_at timestamptz DEFAULT now()
);

ALTER TABLE public.skill_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their skill logs" ON public.skill_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their skill logs" ON public.skill_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX ON public.skill_logs (user_id, skill_name, practiced_at DESC);
