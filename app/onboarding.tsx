import { useRouter } from 'expo-router';
import { GoalQuiz } from '@/components/onboarding/GoalQuiz';
import { getPresetsForGoal } from '@/components/onboarding/HabitPreloader';
import { useData } from '@/lib/data-provider';
import { useAppStore } from '@/store/useAppStore';
import type { UserGoal } from '@/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const data = useData();
  const { session, profile, setProfile, setHabits } = useAppStore();

  async function handleComplete(goal: UserGoal) {
    const userId = session?.user.id;
    if (!userId) return;

    const presets = getPresetsForGoal(goal);

    // Bulk-create the 3 preset habits
    const createdHabits = await Promise.all(
      presets.map((preset) =>
        data.createHabit(userId, {
          title: preset.title,
          description: preset.description ?? undefined,
          category: preset.category,
          science_note: preset.science_note ?? undefined,
        })
      )
    );

    setHabits(createdHabits);

    // Mark onboarding as complete
    await data.updateProfile(userId, {
      onboarding_completed: true,
      user_goal: goal,
    });

    if (profile) {
      setProfile({ ...profile, onboarding_completed: true, user_goal: goal });
    }

    router.replace('/(tabs)');
  }

  return <GoalQuiz onComplete={handleComplete} />;
}
