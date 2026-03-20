import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { calculateStreak } from '@/lib/science';
import { isCompletedToday } from '@/lib/date-utils';
import { isMilestone } from '@/lib/streak-milestones';
import type { Habit, HabitCompletion } from '@/types';

export function useHabits() {
  const {
    session,
    habits,
    setHabits,
    addHabit,
    removeHabit,
    updateHabitCompletions,
    isLoading,
    setIsLoading,
    setError,
    setMilestoneHabit,
  } = useAppStore();
  const data = useData();

  const userId = session?.user?.id;

  const fetchHabits = useCallback(async () => {
    if (data.isDemoMode) return; // In demo mode, habits are set by _layout.tsx
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const habitsWithCompletions = await data.fetchHabits(userId);
      setHabits(habitsWithCompletions);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError('Failed to load habits. Pull down to retry.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, data, setHabits, setIsLoading, setError]);

  const createHabit = useCallback(
    async (input: {
      title: string;
      description?: string;
      category?: Habit['category'];
      science_note?: string;
      target_time?: string;
      color?: string;
      icon?: string;
      difficulty?: Habit['difficulty'];
      trigger_cue?: string;
    }) => {
      if (!userId && !data.isDemoMode) return;

      try {
        const newHabit = await data.createHabit(userId ?? 'demo-user-001', input);
        addHabit(newHabit);
      } catch (err) {
        console.error('Error creating habit:', err);
        setError('Failed to create habit. Please try again.');
        throw err;
      }
    },
    [userId, data, addHabit, setError]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        await data.deleteHabit(id);
        removeHabit(id);
      } catch (err) {
        console.error('Error deleting habit:', err);
        setError('Failed to delete habit. Please try again.');
        throw err;
      }
    },
    [data, removeHabit, setError]
  );

  const toggleHabitCompletion = useCallback(
    async (habitId: string) => {
      if (!userId && !data.isDemoMode) return;

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      // Optimistic update: toggle UI immediately
      const wasCompleted = isCompletedToday(habit.completions);
      const optimisticCompletions = wasCompleted
        ? habit.completions.filter((c) => {
            const t = new Date(c.completed_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return !(t.getTime() >= today.getTime() && t.getTime() < tomorrow.getTime());
          })
        : [
            ...habit.completions,
            {
              id: `temp-${Date.now()}`,
              habit_id: habitId,
              user_id: userId ?? 'demo-user-001',
              completed_at: new Date().toISOString(),
              note: null,
              quality_rating: null,
            } as HabitCompletion,
          ];

      const optimisticStreak = calculateStreak(optimisticCompletions);
      updateHabitCompletions(habitId, optimisticCompletions, optimisticStreak);

      try {
        const updatedCompletions = await data.toggleCompletion(
          habitId,
          userId ?? 'demo-user-001',
          habit.completions
        );
        const newStreak = calculateStreak(updatedCompletions);
        updateHabitCompletions(habitId, updatedCompletions, newStreak);

        // Check for streak milestone on completion (not unchecking)
        if (!wasCompleted && isMilestone(newStreak)) {
          setMilestoneHabit({ habitName: habit.title, streak: newStreak });
        }
      } catch (err) {
        // Roll back optimistic update
        console.error('Error toggling habit completion:', err);
        updateHabitCompletions(habitId, habit.completions, habit.currentStreak);
        setError('Failed to save. Please try again.');
      }
    },
    [userId, data, habits, updateHabitCompletions, setError]
  );

  return { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion, isLoading };
}
