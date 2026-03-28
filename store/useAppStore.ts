import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, HabitCompletion, HabitWithCompletions } from '@/types';
import type { QueuedMutation } from '@/lib/mutation-queue';

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

  // Offline mutation queue
  mutationQueue: QueuedMutation[];
  addMutation: (mutation: QueuedMutation) => void;
  removeMutation: (id: string) => void;
  clearMutationQueue: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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

      // Offline mutation queue
      mutationQueue: [],
      addMutation: (mutation) =>
        set((state) => ({ mutationQueue: [...state.mutationQueue, mutation] })),
      removeMutation: (id) =>
        set((state) => ({ mutationQueue: state.mutationQueue.filter((m) => m.id !== id) })),
      clearMutationQueue: () => set({ mutationQueue: [] }),
    }),
    {
      name: 'thousandx-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        habits: state.habits,
        profile: state.profile,
        mutationQueue: state.mutationQueue,
      }),
    }
  )
);
