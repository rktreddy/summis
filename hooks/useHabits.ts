import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { calculateStreak } from '@/lib/science';
import { isCompletedToday } from '@/lib/date-utils';
import { isMilestone } from '@/lib/streak-milestones';
import { captureException } from '@/lib/error-logging';
import { scheduleStreakReminder } from '@/lib/notifications';
import { isNetworkError } from '@/lib/mutation-queue';
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
    addMutation,
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
      captureException(err, { context: 'fetchHabits' });
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
        captureException(err, { context: 'createHabit' });
        setError('Failed to create habit. Please try again.');
        throw err;
      }
    },
    [userId, data, addHabit, setError]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      // Optimistic remove
      removeHabit(id);

      try {
        await data.deleteHabit(id);
      } catch (err) {
        if (isNetworkError(err)) {
          // Queue for retry on reconnect — keep optimistic state
          addMutation({
            id: `mut-${Date.now()}`,
            type: 'delete_habit',
            payload: { habitId: id },
            createdAt: new Date().toISOString(),
          });
          return;
        }
        captureException(err, { context: 'deleteHabit' });
        setError('Failed to delete habit. Please try again.');
        throw err;
      }
    },
    [data, removeHabit, addMutation, setError]
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

        // Schedule streak protection reminder for incomplete habits
        if (!wasCompleted && newStreak > 0) {
          scheduleStreakReminder(habit.title, newStreak).catch(() => {
            // Non-critical — don't surface to user
          });
        }
      } catch (err) {
        if (isNetworkError(err)) {
          // Queue for retry on reconnect — keep optimistic state (don't roll back)
          addMutation({
            id: `mut-${Date.now()}`,
            type: 'toggle_completion',
            payload: {
              habitId,
              userId: userId ?? 'demo-user-001',
              isUndo: wasCompleted,
              targetDate: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          });
          return;
        }
        // Non-network error: roll back optimistic update
        captureException(err, { context: 'toggleHabitCompletion', habitId });
        updateHabitCompletions(habitId, habit.completions, habit.currentStreak);
        setError('Failed to save. Please try again.');
      }
    },
    [userId, data, habits, updateHabitCompletions, addMutation, setError, setMilestoneHabit]
  );

  return { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion, isLoading };
}
