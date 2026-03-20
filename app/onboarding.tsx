import { useRouter } from 'expo-router';
import { GoalQuiz, type OnboardingResult } from '@/components/onboarding/GoalQuiz';
import { getPresetsForGoal } from '@/components/onboarding/HabitPreloader';
import { useData } from '@/lib/data-provider';
import { useAppStore } from '@/store/useAppStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const data = useData();
  const { session, profile, setProfile, setHabits } = useAppStore();

  async function handleComplete(result: OnboardingResult) {
    const userId = session?.user.id;
    if (!userId) return;

    try {
      const presets = getPresetsForGoal(result.goal);

      const createdHabits = await Promise.all(
        presets.map((preset) =>
          data.createHabit(userId, {
            title: preset.title,
            description: preset.description ?? undefined,
            category: preset.category,
            science_note: preset.science_note ?? undefined,
            difficulty: preset.difficulty,
          })
        )
      );

      setHabits(createdHabits);

      await data.updateProfile(userId, {
        onboarding_completed: true,
        user_goal: result.goal,
        wake_time: result.wakeTime,
        chronotype: result.chronotype,
      });

      if (profile) {
        setProfile({
          ...profile,
          onboarding_completed: true,
          user_goal: result.goal,
          wake_time: result.wakeTime,
          chronotype: result.chronotype,
        });
      }

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Onboarding error:', err);
      try {
        await data.updateProfile(userId, {
          onboarding_completed: true,
          user_goal: result.goal,
        });
        if (profile) {
          setProfile({ ...profile, onboarding_completed: true, user_goal: result.goal });
        }
      } catch {
        // Last resort
      }
      router.replace('/(tabs)');
    }
  }

  return <GoalQuiz onComplete={handleComplete} />;
}
