import { SCIENCE_PROTOCOLS, type ScienceProtocol } from '@/lib/science-protocols';
import type { Habit } from '@/types';

export interface ActiveProtocol {
  id: string;
  user_id: string;
  protocol_id: string;
  started_at: string;
  completed_at: string | null;
  baseline_score: number | null;
  final_score: number | null;
  is_active: boolean;
}

export interface ProtocolPresetHabit {
  title: string;
  description: string;
  category: Habit['category'];
  difficulty: Habit['difficulty'];
  trigger_cue?: string;
}

// Maps protocol IDs to the habits they create when activated
const PROTOCOL_HABITS: Record<string, ProtocolPresetHabit[]> = {
  'ultradian-focus': [
    { title: 'Ultradian Focus Block (90 min)', description: 'One 90-min deep work session per day', category: 'focus', difficulty: 'hard', trigger_cue: 'When I reach my peak focus window' },
    { title: '15-Min Recovery Break', description: 'Full break after each focus block', category: 'recovery', difficulty: 'easy' },
  ],
  'tiny-habits': [
    { title: '2-Minute Habit', description: 'Do the smallest version of a new habit', category: 'general', difficulty: 'easy', trigger_cue: 'After I finish my morning coffee' },
    { title: 'Celebrate After Habit', description: 'Immediately celebrate after completing the tiny habit', category: 'mindfulness', difficulty: 'easy' },
  ],
  'spaced-repetition': [
    { title: 'Spaced Review Session', description: 'Review material at optimal intervals', category: 'focus', difficulty: 'moderate' },
    { title: 'Log Review in Journal', description: 'Record what you reviewed and what stuck', category: 'general', difficulty: 'easy' },
  ],
  'morning-prime': [
    { title: 'Morning Light Exposure (5 min)', description: 'Get sunlight within 30 min of waking', category: 'recovery', difficulty: 'easy', trigger_cue: 'When I wake up' },
    { title: 'Morning Breathwork (5 min)', description: 'Box breathing: 4s in, 4s hold, 4s out, 4s hold', category: 'mindfulness', difficulty: 'easy' },
    { title: 'Set 3 Daily Intentions', description: 'Write 3 priorities in your journal', category: 'focus', difficulty: 'moderate', trigger_cue: 'After my morning breathwork' },
  ],
  'sleep-consistency': [
    { title: 'Consistent Wake Time', description: 'Wake within 30 min of same time daily', category: 'sleep', difficulty: 'easy' },
    { title: 'Wind-Down Alarm', description: 'Set and honor a 60-min pre-bed wind-down', category: 'sleep', difficulty: 'moderate' },
  ],
  'zone2-cardio': [
    { title: 'Zone 2 Cardio (30 min)', description: 'Conversational-pace cardio 3-5x/week', category: 'exercise', difficulty: 'hard' },
    { title: 'Post-Exercise Focus Check', description: 'Rate focus quality after exercise', category: 'general', difficulty: 'easy', trigger_cue: 'After I finish exercising' },
  ],
  'caffeine-timing': [
    { title: 'Delay Caffeine 90 Min', description: 'No caffeine until 90-120 min after waking', category: 'nutrition', difficulty: 'moderate', trigger_cue: 'When I wake up' },
    { title: 'Caffeine Cutoff by 2 PM', description: 'No caffeine after cutoff time', category: 'nutrition', difficulty: 'easy' },
  ],
  'cold-exposure': [
    { title: 'Cold Exposure (2-3 min)', description: 'Cold shower or plunge, 2-4x per week', category: 'recovery', difficulty: 'hard' },
    { title: 'Log Pre/Post Mood', description: 'Rate mood before and after cold exposure', category: 'mindfulness', difficulty: 'easy', trigger_cue: 'Before and after cold exposure' },
  ],
};

export function getProtocolHabits(protocolId: string): ProtocolPresetHabit[] {
  return PROTOCOL_HABITS[protocolId] ?? [];
}

export function getProtocolById(protocolId: string): ScienceProtocol | undefined {
  return SCIENCE_PROTOCOLS.find((p) => p.id === protocolId);
}

/**
 * Calculate progress for an active protocol.
 */
export function getProtocolProgress(protocol: ActiveProtocol): {
  dayNumber: number;
  totalDays: number;
  percentComplete: number;
  isComplete: boolean;
} {
  const started = new Date(protocol.started_at);
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayNumber = Math.min(30, Math.floor((now.getTime() - started.getTime()) / msPerDay) + 1);
  const totalDays = 30;
  const isComplete = dayNumber >= 30 || protocol.completed_at != null;

  return {
    dayNumber,
    totalDays,
    percentComplete: Math.round((dayNumber / totalDays) * 100),
    isComplete,
  };
}
