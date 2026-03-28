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
  DailyPlan,
  DailyPriority,
} from '@/types';

// ── Helpers ────────────────────────────────────────────────────────────

/** Safely parse priorities from Supabase jsonb — handles both array and double-stringified string. */
function parsePriorities(raw: unknown): DailyPriority[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

// ── Interface ──────────────────────────────────────────────────────────

export interface DataProvider {
  isDemoMode: boolean;

  // Auth
  getSession(): Promise<{ user: { id: string } } | null>;

  // Profiles
  fetchProfile(userId: string): Promise<Profile | null>;
  createProfile(userId: string, displayName: string): Promise<Profile | null>;

  // Profile updates
  updateProfile(
    userId: string,
    updates: { onboarding_completed?: boolean; user_goal?: string; wake_time?: string; chronotype?: string }
  ): Promise<void>;

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
      difficulty?: Habit['difficulty'];
      trigger_cue?: string;
    }
  ): Promise<HabitWithCompletions>;
  deleteHabit(id: string, userId?: string): Promise<void>;
  toggleCompletion(
    habitId: string,
    userId: string,
    currentCompletions: HabitCompletion[]
  ): Promise<HabitCompletion[]>;

  // Journal
  fetchJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(
    userId: string,
    data: { content: string; mood: number; energy_level: number; tags: string[]; journal_mode?: string }
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
      interruption_types?: string[];
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

  // Daily Plans
  fetchDailyPlan(userId: string, date: string): Promise<DailyPlan | null>;
  upsertDailyPlan(
    userId: string,
    date: string,
    priorities: DailyPriority[]
  ): Promise<DailyPlan>;
  updateDailyPlanReview(
    userId: string,
    date: string,
    rating: number,
    notes: string
  ): Promise<void>;
  updateDailyPlanPriorities(
    userId: string,
    date: string,
    priorities: DailyPriority[]
  ): Promise<void>;
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
      .select('id, display_name, timezone, onboarding_completed, user_goal, wake_time, chronotype, subscription_tier, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return data as Profile;
  },

  async createProfile(userId, displayName) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        display_name: displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select('id, display_name, timezone, onboarding_completed, user_goal, subscription_tier, created_at')
      .single();
    if (error) throw new Error(error.message);
    return data ? { ...data, wake_time: null, chronotype: null } as Profile : null;
  },

  async updateProfile(userId, updates) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw new Error(error.message);
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

    return habitsData.map((h) => {
      const completions = completionsByHabit.get(h.id) ?? [];
      return {
        ...h,
        difficulty: (h as Partial<Habit>).difficulty ?? 'moderate' as const,
        trigger_cue: (h as Partial<Habit>).trigger_cue ?? null,
        completions,
        currentStreak: calculateStreak(completions),
      } as HabitWithCompletions;
    });
  },

  async createHabit(userId, data) {
    // Use server-side RPC that enforces free-tier habit limit
    const { data: habitId, error: rpcError } = await supabase.rpc('create_habit_with_limit_check', {
      p_title: data.title,
      p_description: data.description ?? null,
      p_category: data.category ?? null,
      p_science_note: data.science_note ?? null,
      p_target_time: data.target_time ?? null,
      p_color: data.color ?? null,
      p_icon: data.icon ?? null,
      p_difficulty: data.difficulty ?? 'moderate',
      p_trigger_cue: data.trigger_cue ?? null,
    });

    if (rpcError) {
      if (rpcError.message?.includes('FREE_TIER_HABIT_LIMIT')) {
        throw new Error('FREE_TIER_HABIT_LIMIT');
      }
      throw new Error(rpcError.message);
    }

    // Fetch the created habit by ID
    const { data: newHabit, error: fetchError } = await supabase
      .from('habits')
      .select('id, user_id, title, description, science_note, category, frequency, target_time, color, icon, is_active, sort_order, created_at')
      .eq('id', habitId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    return { ...newHabit, difficulty: data.difficulty ?? 'moderate', trigger_cue: data.trigger_cue ?? null, completions: [], currentStreak: 0 };
  },

  async deleteHabit(id) {
    // Soft delete: set is_active = false to preserve completion history
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async toggleCompletion(habitId, userId, currentCompletions) {
    const todayCompletion = findTodayCompletion(currentCompletions);

    if (todayCompletion) {
      const { error: delError } = await supabase.from('habit_completions').delete().eq('id', todayCompletion.id);
      if (delError) throw new Error(delError.message);
    } else {
      const { error: insError } = await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: userId,
      });
      if (insError) throw new Error(insError.message);
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
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, user_id, content, mood, energy_level, tags, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((e) => ({ ...e, journal_mode: (e as Partial<JournalEntry>).journal_mode ?? 'free' })) as JournalEntry[];
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
        ...(data.journal_mode ? { journal_mode: data.journal_mode } : {}),
      })
      .select('id, user_id, content, mood, energy_level, tags, created_at')
      .single();
    // Retry without journal_mode if the column doesn't exist yet
    if (error?.message?.includes('journal_mode')) {
      const { data: retryEntry, error: retryError } = await supabase
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
      if (retryError) throw new Error(retryError.message);
      return retryEntry ? { ...retryEntry, journal_mode: data.journal_mode ?? 'free' } as JournalEntry : null;
    }
    if (error) throw new Error(error.message);
    return entry ? { ...entry, journal_mode: data.journal_mode ?? 'free' } as JournalEntry : null;
  },

  async saveFocusSession(userId, data) {
    const { error } = await supabase.from('focus_sessions').insert({
      user_id: userId,
      duration_minutes: data.duration_minutes,
      session_type: data.session_type,
      completed: data.completed,
      started_at: data.started_at,
      ended_at: data.ended_at,
      interruptions: data.interruption_types?.length ?? 0,
      ...(data.interruption_types?.length ? { interruption_types: data.interruption_types } : {}),
    });
    // Retry without interruption_types if the column doesn't exist yet
    if (error?.message?.includes('interruption_types')) {
      const { error: retryError } = await supabase.from('focus_sessions').insert({
        user_id: userId,
        duration_minutes: data.duration_minutes,
        session_type: data.session_type,
        completed: data.completed,
        started_at: data.started_at,
        ended_at: data.ended_at,
        interruptions: data.interruption_types?.length ?? 0,
      });
      if (retryError) throw new Error(retryError.message);
      return;
    }
    if (error) throw new Error(error.message);
  },

  async fetchFocusSessions(userId, since) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('id, duration_minutes, completed, user_id, session_type, interruptions, quality_rating, notes, started_at, ended_at')
      .eq('user_id', userId)
      .gte('started_at', since.toISOString())
      .eq('completed', true);
    if (error) throw new Error(error.message);
    return (data ?? []).map((s) => ({
      ...s,
      interruption_types: (s as Partial<FocusSession>).interruption_types ?? [],
    })) as FocusSession[];
  },

  async upsertPerformanceScore(userId, weekStart, scores) {
    const { data, error } = await supabase
      .from('performance_scores')
      .upsert(
        { user_id: userId, week_start: weekStart, ...scores },
        { onConflict: 'user_id,week_start' }
      )
      .select('id, user_id, week_start, overall_score, habit_score, focus_score, consistency_score, computed_at')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async fetchPerformanceScore(userId, weekStart) {
    const { data, error } = await supabase
      .from('performance_scores')
      .select('id, user_id, week_start, overall_score, habit_score, focus_score, consistency_score, computed_at')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  },

  async fetchDailyPlan(userId, date) {
    const { data, error } = await supabase
      .from('daily_plans')
      .select('id, user_id, date, priorities, review_notes, day_rating, created_at')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      ...data,
      priorities: parsePriorities(data.priorities),
    } as DailyPlan;
  },

  async upsertDailyPlan(userId, date, priorities) {
    const { data, error } = await supabase
      .from('daily_plans')
      .upsert(
        { user_id: userId, date, priorities },
        { onConflict: 'user_id,date' }
      )
      .select('id, user_id, date, priorities, review_notes, day_rating, created_at')
      .single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      priorities: parsePriorities(data.priorities),
    } as DailyPlan;
  },

  async updateDailyPlanReview(userId, date, rating, notes) {
    const { error } = await supabase
      .from('daily_plans')
      .update({ day_rating: rating, review_notes: notes })
      .eq('user_id', userId)
      .eq('date', date);
    if (error) throw new Error(error.message);
  },

  async updateDailyPlanPriorities(userId, date, priorities) {
    const { error } = await supabase
      .from('daily_plans')
      .update({ priorities })
      .eq('user_id', userId)
      .eq('date', date);
    if (error) throw new Error(error.message);
  },
};

// ── Mock implementation ────────────────────────────────────────────────

let mockHabits = [...MOCK_HABITS];
let mockJournalEntries = [...MOCK_JOURNAL_ENTRIES];
let mockDailyPlans: DailyPlan[] = [];

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

  async updateProfile() {
    // No-op in demo mode
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
      difficulty: data.difficulty ?? 'moderate',
      trigger_cue: data.trigger_cue ?? null,
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
    mockHabits = mockHabits.map((h) =>
      h.id === id ? { ...h, is_active: false } : h
    ).filter((h) => h.is_active);
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
      journal_mode: (data.journal_mode as JournalEntry['journal_mode']) ?? 'free',
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

  async fetchDailyPlan(_userId, date) {
    return mockDailyPlans.find((p) => p.date === date) ?? null;
  },

  async upsertDailyPlan(userId, date, priorities) {
    const existing = mockDailyPlans.find((p) => p.date === date);
    if (existing) {
      existing.priorities = priorities;
      return existing;
    }
    const plan: DailyPlan = {
      id: `dp-${Date.now()}`,
      user_id: userId,
      date,
      priorities,
      review_notes: null,
      day_rating: null,
      created_at: new Date().toISOString(),
    };
    mockDailyPlans.push(plan);
    return plan;
  },

  async updateDailyPlanReview(_userId, date, rating, notes) {
    const plan = mockDailyPlans.find((p) => p.date === date);
    if (plan) {
      plan.day_rating = rating;
      plan.review_notes = notes;
    }
  },

  async updateDailyPlanPriorities(_userId, date, priorities) {
    const plan = mockDailyPlans.find((p) => p.date === date);
    if (plan) {
      plan.priorities = priorities;
    }
  },
};

// ── Context ────────────────────────────────────────────────────────────

const IS_DEMO = process.env.EXPO_PUBLIC_DEMO_MODE === 'true'
  || process.env.EXPO_PUBLIC_SUPABASE_URL === undefined
  || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

const DataContext = createContext<DataProvider>(IS_DEMO ? mockProvider : supabaseProvider);

export function DataProviderRoot({ children }: { children: React.ReactNode }) {
  const provider = IS_DEMO ? mockProvider : supabaseProvider;
  return <DataContext.Provider value={provider}>{children}</DataContext.Provider>;
}

export function useData(): DataProvider {
  return useContext(DataContext);
}
