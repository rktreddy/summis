import React, { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateStreak } from '@/lib/science';
import { isToday, findTodayCompletion } from '@/lib/date-utils';
import {
  MOCK_PROFILE,
  MOCK_HABITS,
  MOCK_JOURNAL_ENTRIES,
  MOCK_FOCUS_SESSIONS,
} from '@/lib/mock-data';
import type {
  Profile,
  Habit,
  HabitCompletion,
  HabitWithCompletions,
  JournalEntry,
  FocusSession,
  PerformanceScore,
} from '@/types';

// ── Interface ──────────────────────────────────────────────────────────

export interface DataProvider {
  isDemoMode: boolean;

  // Auth
  getSession(): Promise<{ user: { id: string } } | null>;

  // Profiles
  fetchProfile(userId: string): Promise<Profile | null>;
  createProfile(userId: string, displayName: string): Promise<Profile | null>;

  // Habits
  fetchHabits(userId: string): Promise<HabitWithCompletions[]>;
  createHabit(
    userId: string,
    data: {
      title: string;
      description?: string;
      category?: Habit['category'];
      science_note?: string;
      target_time?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<HabitWithCompletions>;
  deleteHabit(id: string): Promise<void>;
  toggleCompletion(
    habitId: string,
    userId: string,
    currentCompletions: HabitCompletion[]
  ): Promise<HabitCompletion[]>;

  // Journal
  fetchJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(
    userId: string,
    data: { content: string; mood: number; energy_level: number; tags: string[] }
  ): Promise<JournalEntry | null>;

  // Focus
  saveFocusSession(
    userId: string,
    data: {
      duration_minutes: number;
      session_type: string;
      completed: boolean;
      started_at: string;
      ended_at: string;
    }
  ): Promise<void>;

  // Performance scores
  fetchFocusSessions(userId: string, since: Date): Promise<FocusSession[]>;
  upsertPerformanceScore(
    userId: string,
    weekStart: string,
    scores: { overall_score: number; habit_score: number; focus_score: number; consistency_score: number }
  ): Promise<PerformanceScore | null>;
  fetchPerformanceScore(userId: string, weekStart: string): Promise<PerformanceScore | null>;
}

// ── Supabase implementation ────────────────────────────────────────────

const supabaseProvider: DataProvider = {
  isDemoMode: false,

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { user: { id: session.user.id } } : null;
  },

  async fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, timezone, onboarding_completed, subscription_tier, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async createProfile(userId, displayName) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        display_name: displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select('id, display_name, timezone, onboarding_completed, subscription_tier, created_at')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async fetchHabits(userId) {
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('id, user_id, title, description, science_note, category, frequency, target_time, color, icon, is_active, sort_order, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (habitsError) throw new Error(habitsError.message);
    if (!habitsData) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: completionsData, error: completionsError } = await supabase
      .from('habit_completions')
      .select('id, habit_id, user_id, completed_at, note, quality_rating')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    if (completionsError) throw new Error(completionsError.message);

    const completionsByHabit = new Map<string, HabitCompletion[]>();
    for (const c of completionsData ?? []) {
      const existing = completionsByHabit.get(c.habit_id) ?? [];
      existing.push(c);
      completionsByHabit.set(c.habit_id, existing);
    }

    return habitsData.map((h: Habit) => {
      const completions = completionsByHabit.get(h.id) ?? [];
      return { ...h, completions, currentStreak: calculateStreak(completions) };
    });
  },

  async createHabit(userId, data) {
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

    if (error) throw new Error(error.message);
    return { ...newHabit, completions: [], currentStreak: 0 };
  },

  async deleteHabit(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async toggleCompletion(habitId, userId, currentCompletions) {
    const todayCompletion = findTodayCompletion(currentCompletions);

    if (todayCompletion) {
      await supabase.from('habit_completions').delete().eq('id', todayCompletion.id);
    } else {
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

    return completions ?? [];
  },

  async fetchJournalEntries(userId) {
    const { data } = await supabase
      .from('journal_entries')
      .select('id, user_id, content, mood, energy_level, tags, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return data ?? [];
  },

  async createJournalEntry(userId, data) {
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: data.content,
        mood: data.mood,
        energy_level: data.energy_level,
        tags: data.tags,
      })
      .select('id, user_id, content, mood, energy_level, tags, created_at')
      .single();
    if (error) throw new Error(error.message);
    return entry;
  },

  async saveFocusSession(userId, data) {
    const { error } = await supabase.from('focus_sessions').insert({
      user_id: userId,
      duration_minutes: data.duration_minutes,
      session_type: data.session_type,
      completed: data.completed,
      started_at: data.started_at,
      ended_at: data.ended_at,
    });
    if (error) throw new Error(error.message);
  },

  async fetchFocusSessions(userId, since) {
    const { data } = await supabase
      .from('focus_sessions')
      .select('id, duration_minutes, completed, user_id, session_type, interruptions, quality_rating, notes, started_at, ended_at')
      .eq('user_id', userId)
      .gte('started_at', since.toISOString())
      .eq('completed', true);
    return (data ?? []) as FocusSession[];
  },

  async upsertPerformanceScore(userId, weekStart, scores) {
    const { data } = await supabase
      .from('performance_scores')
      .upsert(
        { user_id: userId, week_start: weekStart, ...scores },
        { onConflict: 'user_id,week_start' }
      )
      .select('id, user_id, week_start, overall_score, habit_score, focus_score, consistency_score, computed_at')
      .single();
    return data;
  },

  async fetchPerformanceScore(userId, weekStart) {
    const { data } = await supabase
      .from('performance_scores')
      .select('id, user_id, week_start, overall_score, habit_score, focus_score, consistency_score, computed_at')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();
    return data ?? null;
  },
};

// ── Mock implementation ────────────────────────────────────────────────

let mockHabits = [...MOCK_HABITS];
let mockJournalEntries = [...MOCK_JOURNAL_ENTRIES];

const mockProvider: DataProvider = {
  isDemoMode: true,

  async getSession() {
    return { user: { id: MOCK_PROFILE.id } };
  },

  async fetchProfile() {
    return MOCK_PROFILE;
  },

  async createProfile(_userId, displayName) {
    return { ...MOCK_PROFILE, display_name: displayName };
  },

  async fetchHabits() {
    return mockHabits;
  },

  async createHabit(_userId, data) {
    const habit: HabitWithCompletions = {
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
    mockHabits = [habit, ...mockHabits];
    return habit;
  },

  async deleteHabit(id) {
    mockHabits = mockHabits.filter((h) => h.id !== id);
  },

  async toggleCompletion(habitId, _userId, currentCompletions) {
    const todayCompletion = findTodayCompletion(currentCompletions);
    if (todayCompletion) {
      return currentCompletions.filter((c) => c.id !== todayCompletion.id);
    }
    return [
      ...currentCompletions,
      {
        id: `c-${Date.now()}`,
        habit_id: habitId,
        user_id: 'demo-user-001',
        completed_at: new Date().toISOString(),
        note: null,
        quality_rating: null,
      },
    ];
  },

  async fetchJournalEntries() {
    return mockJournalEntries;
  },

  async createJournalEntry(_userId, data) {
    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      user_id: 'demo-user-001',
      content: data.content,
      mood: data.mood,
      energy_level: data.energy_level,
      tags: data.tags,
      created_at: new Date().toISOString(),
    };
    mockJournalEntries = [entry, ...mockJournalEntries];
    return entry;
  },

  async saveFocusSession() {
    // No-op in demo mode
  },

  async fetchFocusSessions() {
    return MOCK_FOCUS_SESSIONS;
  },

  async upsertPerformanceScore(_userId, weekStart, scores) {
    return {
      id: `ps-${Date.now()}`,
      user_id: 'demo-user-001',
      week_start: weekStart,
      overall_score: scores.overall_score,
      habit_score: scores.habit_score,
      focus_score: scores.focus_score,
      consistency_score: scores.consistency_score,
      computed_at: new Date().toISOString(),
    };
  },

  async fetchPerformanceScore() {
    return null;
  },
};

// ── Context ────────────────────────────────────────────────────────────

const IS_DEMO = process.env.EXPO_PUBLIC_SUPABASE_URL === undefined
  || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

const DataContext = createContext<DataProvider>(IS_DEMO ? mockProvider : supabaseProvider);

export function DataProviderRoot({ children }: { children: React.ReactNode }) {
  const provider = IS_DEMO ? mockProvider : supabaseProvider;
  return <DataContext.Provider value={provider}>{children}</DataContext.Provider>;
}

export function useData(): DataProvider {
  return useContext(DataContext);
}
