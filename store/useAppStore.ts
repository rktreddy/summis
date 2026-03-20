import { create } from 'zustand';
import type { Profile, HabitCompletion, HabitWithCompletions } from '@/types';

interface AppState {
  session: { user: { id: string } } | null;
  profile: Profile | null;
  setSession: (session: AppState['session']) => void;
  setProfile: (profile: Profile | null) => void;

  habits: HabitWithCompletions[];
  setHabits: (habits: HabitWithCompletions[]) => void;
  addHabit: (habit: HabitWithCompletions) => void;
  removeHabit: (id: string) => void;
  updateHabitCompletions: (habitId: string, completions: HabitCompletion[], streak: number) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  milestoneHabit: { habitName: string; streak: number } | null;
  setMilestoneHabit: (m: { habitName: string; streak: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  habits: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  removeHabit: (id) =>
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  updateHabitCompletions: (habitId, completions, streak) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? { ...h, completions, currentStreak: streak }
          : h
      ),
    })),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  error: null,
  setError: (error) => set({ error }),

  milestoneHabit: null,
  setMilestoneHabit: (milestoneHabit) => set({ milestoneHabit }),
}));
