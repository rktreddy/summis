export type UserGoal = 'focus' | 'sleep' | 'fitness' | 'general';

export type Chronotype = 'early' | 'moderate' | 'late';

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  onboarding_completed: boolean;
  user_goal: UserGoal | null;
  wake_time: string | null;
  chronotype: Chronotype | null;
  subscription_tier: 'free' | 'pro' | 'lifetime';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  science_note: string | null;
  category: 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness' | 'recovery' | 'general' | null;
  frequency: 'daily' | 'weekdays' | 'custom';
  target_time: string | null;
  color: string | null;
  icon: string | null;
  difficulty: 'easy' | 'moderate' | 'hard';
  trigger_cue: string | null;
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
  journal_mode: 'free' | 'gratitude' | 'reflection' | null;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: 'deep_work' | 'study' | 'creative' | 'admin' | 'practice';
  completed: boolean;
  interruptions: number;
  interruption_types: string[];
  quality_rating: number | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface DailyScore {
  date: string;
  overallScore: number;
  habitScore: number;
  focusScore: number;
  consistencyScore: number;
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

export interface AccountabilityPartner {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string | null;
  status: 'pending' | 'active' | 'declined';
  created_at: string;
}

export interface StreakChallenge {
  id: string;
  partnership_id: string;
  habit_title: string;
  target_days: number;
  user_progress: number;
  partner_progress: number;
  started_at: string;
  completed_at: string | null;
}

export interface DailyPriority {
  id: string;
  title: string;
  session_type: FocusSession['session_type'];
  estimated_minutes: number;
  suggested_time: string | null;
  completed: boolean;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  priorities: DailyPriority[];
  review_notes: string | null;
  day_rating: number | null;
  created_at: string;
}
