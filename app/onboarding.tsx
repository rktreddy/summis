import { useRouter } from 'expo-router';
import { CognitiveHygieneSetup } from '@/components/onboarding/CognitiveHygieneSetup';
import { useData } from '@/lib/data-provider';
import { useAppStore } from '@/store/useAppStore';
import { getDefaultHygieneConfigs } from '@/lib/hygiene-engine';
import type { OnboardingConfig } from '@/types/summis';

export default function OnboardingScreen() {
  const router = useRouter();
  const data = useData();
  const { session, profile, setProfile, setHygieneConfigs } = useAppStore();

  async function handleComplete(config: OnboardingConfig) {
    const userId = session?.user.id;
    if (!userId) return;

    try {
      // Create default hygiene configs
      const defaultConfigs = getDefaultHygieneConfigs(userId);
      // TODO: persist hygiene configs via data provider
      // For now, set them in the store with generated IDs
      const configsWithIds = defaultConfigs.map((c, i) => ({
        ...c,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      }));
      setHygieneConfigs(configsWithIds);

      // Update profile with onboarding data
      await data.updateProfile(userId, {
        onboarding_completed: true,
        wake_time: config.wakeTime,
        chronotype: config.chronotype,
      });

      if (profile) {
        setProfile({
          ...profile,
          onboarding_completed: true,
          wake_time: config.wakeTime,
          chronotype: config.chronotype,
        });
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Onboarding error:', err);
      try {
        await data.updateProfile(userId, { onboarding_completed: true });
        if (profile) {
          setProfile({ ...profile, onboarding_completed: true });
        }
      } catch {
        // Last resort
      }
      router.replace('/(tabs)');
    }
  }

  return <CognitiveHygieneSetup onComplete={handleComplete} />;
}
