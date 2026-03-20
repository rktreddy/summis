-- 009: Active protocols table for tracking 30-day protocol adherence
CREATE TABLE IF NOT EXISTS public.active_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  protocol_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  baseline_score int,
  final_score int,
  is_active boolean DEFAULT true
);

ALTER TABLE public.active_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their protocols" ON public.active_protocols
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their protocols" ON public.active_protocols
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their protocols" ON public.active_protocols
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX ON public.active_protocols (user_id, is_active);
