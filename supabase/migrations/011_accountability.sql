-- 011: Accountability partners and streak challenges
CREATE TABLE IF NOT EXISTS public.accountability_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

CREATE TABLE IF NOT EXISTS public.streak_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid REFERENCES public.accountability_partners(id) ON DELETE CASCADE,
  habit_title text NOT NULL,
  target_days int NOT NULL DEFAULT 7,
  user_progress int DEFAULT 0,
  partner_progress int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their partnerships" ON public.accountability_partners
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users see their challenges" ON public.streak_challenges
  FOR ALL USING (
    partnership_id IN (
      SELECT id FROM public.accountability_partners
      WHERE user_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE INDEX ON public.accountability_partners (user_id);
CREATE INDEX ON public.accountability_partners (partner_id);
