import { useRouter } from 'expo-router';
import { CognitiveHygieneSetup } from '@/components/onboarding/CognitiveHygieneSetup';
import { useData } from '@/lib/data-provider';
import { useAppStore } from '@/store/useAppStore';
import { getDefaultHygieneConfigs } from '@/lib/hygiene-engine';
import { registerForPushNotifications } from '@/lib/notifications';
import { scheduleEnergyPhaseNotifications, scheduleMorningPrime } from '@/lib/ultradian-notifications';
import type { OnboardingConfig } from '@/types/summis';

export default function OnboardingScreen() {
  const router = useRouter();
  const data = useData();
  const { session, profile, setProfile, setHygieneConfigs } = useAppStore();

  async function handleComplete(config: OnboardingConfig) {
    const userId = session?.user.id;
    if (!userId) return;

    try {
      // Create default hygiene configs and persist to backend
      const defaultConfigs = getDefaultHygieneConfigs(userId);
      const savedConfigs = await Promise.all(
        defaultConfigs.map(({ user_id: _, ...configData }) =>
          data.createHygieneConfig(userId, configData)
        )
      );
      setHygieneConfigs(savedConfigs);

      // Update profile with onboarding data
      const profileUpdates = {
        onboarding_completed: true,
        wake_time: config.wakeTime,
        chronotype: config.chronotype,
        sprint_duration_preference: config.sprintDuration,
        daily_sprint_target: config.dailySprintTarget,
        phone_placement_commitment: config.phonePlacement,
        peak_window_start: config.peakWindowStart,
        peak_window_end: config.peakWindowEnd,
        afternoon_window_start: config.afternoonWindowStart,
        afternoon_window_end: config.afternoonWindowEnd,
        notification_audit_completed: config.notificationAuditCompleted,
        hygiene_setup_completed: true,
      };
      await data.updateProfile(userId, profileUpdates);

      if (profile) {
        setProfile({ ...profile, ...profileUpdates });
      }

      // Schedule notifications based on chronotype + wake time
      registerForPushNotifications().then(() => {
        scheduleEnergyPhaseNotifications(config.chronotype, config.wakeTime).catch(console.warn);
        const [h, m] = config.wakeTime.split(':').map(Number);
        const wakeDate = new Date();
        wakeDate.setHours(h, m, 0, 0);
        scheduleMorningPrime(wakeDate).catch(console.warn);
      }).catch(console.warn);

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
