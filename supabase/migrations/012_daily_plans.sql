-- 012: Daily plans for predictive daily planner
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  priorities jsonb NOT NULL DEFAULT '[]',
  review_notes text,
  day_rating int CHECK (day_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their plans" ON public.daily_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX ON public.daily_plans (user_id, date DESC);
