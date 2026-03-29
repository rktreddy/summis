import { useAppStore } from '@/store/useAppStore';
import { canStartSprint } from '@/lib/features';

export function useSubscription() {
  const profile = useAppStore((state) => state.profile);
  const tier = profile?.subscription_tier ?? 'free';
  const isPro = tier === 'pro' || tier === 'lifetime';

  function canStartMoreSprints(todayCount: number): boolean {
    return canStartSprint(tier, todayCount);
  }

  return { tier, isPro, canStartMoreSprints };
}
