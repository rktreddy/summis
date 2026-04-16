-- Migration 017: Protect subscription_tier and onboarding_completed from client modification
-- subscription_tier must only be changed via server-side webhook (RevenueCat)
-- onboarding_completed must not be set back to false

-- Drop existing permissive UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate UPDATE policy that prevents users from modifying subscription_tier
-- and from setting onboarding_completed to false
CREATE POLICY "Users can update own profile (protected fields)"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND subscription_tier = (SELECT p.subscription_tier FROM profiles p WHERE p.id = auth.uid())
    AND (
      onboarding_completed = true
      OR onboarding_completed = (SELECT p.onboarding_completed FROM profiles p WHERE p.id = auth.uid())
    )
  );
