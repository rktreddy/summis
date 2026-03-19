import { useAppStore } from '@/store/useAppStore';
import { FEATURES } from '@/lib/features';

export function useSubscription() {
  const profile = useAppStore((state) => state.profile);
  const tier = profile?.subscription_tier ?? 'free';
  const isPro = tier === 'pro' || tier === 'lifetime';

  function canAddHabit(currentCount: number): boolean {
    if (isPro) return true;
    return currentCount < FEATURES.habits_limit;
  }

  return { tier, isPro, canAddHabit };
}
