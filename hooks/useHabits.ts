import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { calculateStreak } from '@/lib/science';
import type { Habit, HabitCompletion, HabitWithCompletions } from '@/types';

const DEMO_MODE = process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

export function useHabits() {
  const { session, habits, setHabits, addHabit, removeHabit, updateHabitCompletions, isLoading, setIsLoading } =
    useAppStore();

  const userId = session?.user?.id;

  const fetchHabits = useCallback(async () => {
    if (DEMO_MODE) return; // In demo mode, habits are set by _layout.tsx
    if (!userId) return;
    setIsLoading(true);

    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, user_id, title, description, science_note, category, frequency, target_time, color, icon, is_active, sort_order, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (habitsError) throw habitsError;
      if (!habitsData) {
        setHabits([]);
        return;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('id, habit_id, user_id, completed_at, note, quality_rating')
        .eq('user_id', userId)
        .gte('completed_at', thirtyDaysAgo.toISOString());

      if (completionsError) throw completionsError;

      const completionsByHabit = new Map<string, HabitCompletion[]>();
      for (const c of completionsData ?? []) {
        const existing = completionsByHabit.get(c.habit_id) ?? [];
        existing.push(c);
        completionsByHabit.set(c.habit_id, existing);
      }

      const habitsWithCompletions: HabitWithCompletions[] = habitsData.map((h: Habit) => {
        const completions = completionsByHabit.get(h.id) ?? [];
        return {
          ...h,
          completions,
          currentStreak: calculateStreak(completions),
        };
      });

      setHabits(habitsWithCompletions);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, setHabits, setIsLoading]);

  const createHabit = useCallback(
    async (data: {
      title: string;
      description?: string;
      category?: Habit['category'];
      science_note?: string;
      target_time?: string;
      color?: string;
      icon?: string;
    }) => {
      if (DEMO_MODE) {
        const demoHabit: HabitWithCompletions = {
          id: `h-${Date.now()}`,
          user_id: 'demo-user-001',
          title: data.title,
          description: data.description ?? null,
          science_note: data.science_note ?? null,
          category: data.category ?? null,
          frequency: 'daily',
          target_time: data.target_time ?? null,
          color: data.color ?? null,
          icon: data.icon ?? null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          completions: [],
          currentStreak: 0,
        };
        addHabit(demoHabit);
        return;
      }

      if (!userId) return;

      const { data: newHabit, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description ?? null,
          category: data.category ?? null,
          science_note: data.science_note ?? null,
          target_time: data.target_time ?? null,
          color: data.color ?? null,
          icon: data.icon ?? null,
        })
        .select('id, user_id, title, description, science_note, category, frequency, target_time, color, icon, is_active, sort_order, created_at')
        .single();

      if (error) {
        console.error('Error creating habit:', error);
        throw error;
      }

      if (newHabit) {
        addHabit({ ...newHabit, completions: [], currentStreak: 0 });
      }
    },
    [userId, addHabit]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (DEMO_MODE) {
        removeHabit(id);
        return;
      }
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) {
        console.error('Error deleting habit:', error);
        throw error;
      }
      removeHabit(id);
    },
    [removeHabit]
  );

  const toggleHabitCompletion = useCallback(
    async (habitId: string) => {
      if (DEMO_MODE) {
        // Toggle locally in demo mode
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCompletion = habit.completions.find((c) => {
          const t = new Date(c.completed_at).getTime();
          return t >= today.getTime() && t < tomorrow.getTime();
        });

        let newCompletions;
        if (todayCompletion) {
          newCompletions = habit.completions.filter((c) => c.id !== todayCompletion.id);
        } else {
          newCompletions = [
            ...habit.completions,
            {
              id: `c-${Date.now()}`,
              habit_id: habitId,
              user_id: 'demo-user-001',
              completed_at: new Date().toISOString(),
              note: null,
              quality_rating: null,
            },
          ];
        }
        updateHabitCompletions(habitId, newCompletions, calculateStreak(newCompletions));
        return;
      }

      if (!userId) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if already completed today
      const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        // Remove today's completion
        await supabase.from('habit_completions').delete().eq('id', existing[0].id);
      } else {
        // Add completion
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: userId,
        });
      }

      // Refetch completions for this habit
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completions } = await supabase
        .from('habit_completions')
        .select('id, habit_id, user_id, completed_at, note, quality_rating')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', thirtyDaysAgo.toISOString());

      const updatedCompletions = completions ?? [];
      updateHabitCompletions(habitId, updatedCompletions, calculateStreak(updatedCompletions));
    },
    [userId, habits, updateHabitCompletions]
  );

  return { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion, isLoading };
}
