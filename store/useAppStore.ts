import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, HabitCompletion, HabitWithCompletions } from '@/types';
import type { Sprint, MIT, HygieneConfig, HygieneLog } from '@/types/summis';
import type { QueuedMutation } from '@/lib/mutation-queue';

interface AppState {
  session: { user: { id: string } } | null;
  profile: Profile | null;
  setSession: (session: AppState['session']) => void;
  setProfile: (profile: Profile | null) => void;

  // Legacy habits (kept for migration compatibility)
  habits: HabitWithCompletions[];
  setHabits: (habits: HabitWithCompletions[]) => void;
  addHabit: (habit: HabitWithCompletions) => void;
  removeHabit: (id: string) => void;
  updateHabitCompletions: (habitId: string, completions: HabitCompletion[], streak: number) => void;

  // Sprints
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;

  // MITs
  mits: MIT[];
  setMITs: (mits: MIT[]) => void;
  addMIT: (mit: MIT) => void;
  updateMIT: (id: string, updates: Partial<MIT>) => void;
  removeMIT: (id: string) => void;

  // Cognitive Hygiene
  hygieneConfigs: HygieneConfig[];
  setHygieneConfigs: (configs: HygieneConfig[]) => void;
  hygieneLogs: HygieneLog[];
  setHygieneLogs: (logs: HygieneLog[]) => void;
  addHygieneLog: (log: HygieneLog) => void;

  // Active sprint tracking
  activeSprint: Sprint | null;
  setActiveSprint: (sprint: Sprint | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Legacy milestone (kept for now)
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

      // Legacy habits
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

      // Sprints
      sprints: [],
      setSprints: (sprints) => set({ sprints }),
      addSprint: (sprint) => set((state) => ({ sprints: [sprint, ...state.sprints] })),
      updateSprint: (id, updates) =>
        set((state) => ({
          sprints: state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      // MITs
      mits: [],
      setMITs: (mits) => set({ mits }),
      addMIT: (mit) => set((state) => ({ mits: [...state.mits, mit] })),
      updateMIT: (id, updates) =>
        set((state) => ({
          mits: state.mits.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      removeMIT: (id) =>
        set((state) => ({ mits: state.mits.filter((m) => m.id !== id) })),

      // Cognitive Hygiene
      hygieneConfigs: [],
      setHygieneConfigs: (hygieneConfigs) => set({ hygieneConfigs }),
      hygieneLogs: [],
      setHygieneLogs: (hygieneLogs) => set({ hygieneLogs }),
      addHygieneLog: (log) =>
        set((state) => ({ hygieneLogs: [...state.hygieneLogs, log] })),

      // Active sprint
      activeSprint: null,
      setActiveSprint: (activeSprint) => set({ activeSprint }),

      // UI state
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),

      // Legacy
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
      name: 'summis-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        habits: state.habits,
        profile: state.profile,
        sprints: state.sprints,
        mits: state.mits,
        hygieneConfigs: state.hygieneConfigs,
        hygieneLogs: state.hygieneLogs,
        mutationQueue: state.mutationQueue,
      }),
    }
  )
);
