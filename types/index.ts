export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  onboarding_completed: boolean;
  subscription_tier: 'free' | 'pro' | 'lifetime';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  science_note: string | null;
  category: 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness' | null;
  frequency: 'daily' | 'weekdays' | 'custom';
  target_time: string | null;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  note: string | null;
  quality_rating: number | null;
}

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  currentStreak: number;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: number | null;
  energy_level: number | null;
  tags: string[];
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: 'deep_work' | 'study' | 'creative' | 'admin';
  completed: boolean;
  interruptions: number;
  quality_rating: number | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface PerformanceScore {
  id: string;
  user_id: string;
  week_start: string;
  overall_score: number | null;
  habit_score: number | null;
  focus_score: number | null;
  consistency_score: number | null;
  computed_at: string;
}
