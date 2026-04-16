-- Migration 018: Server-side sprint limit enforcement for free users
-- Free users are limited to 3 sprints per day (matching FEATURES.daily_sprints)

-- Drop existing INSERT policy if any
DROP POLICY IF EXISTS "Users can insert own sprints" ON sprints;

-- Create INSERT policy with daily limit enforcement
CREATE POLICY "Users can insert own sprints (with daily limit)"
  ON sprints
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Pro/lifetime users: no limit
      (SELECT p.subscription_tier FROM profiles p WHERE p.id = auth.uid()) IN ('pro', 'lifetime')
      OR
      -- Free users: max 3 per day
      (
        SELECT COUNT(*)
        FROM sprints s
        WHERE s.user_id = auth.uid()
          AND s.date = date
      ) < 3
    )
  );
