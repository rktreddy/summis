import { computeDailySchedule, formatTime, type Chronotype } from '@/lib/chronotype';
import type { DailyPriority, FocusSession } from '@/types';

/**
 * Generate a unique ID for a priority.
 */
export function generatePriorityId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Create an empty priority with suggested timing.
 */
export function createEmptyPriority(
  index: number,
  wakeTime?: string,
  chronotype?: Chronotype
): DailyPriority {
  let suggestedTime: string | null = null;

  if (wakeTime && chronotype) {
    const schedule = computeDailySchedule(wakeTime, chronotype);
    if (index === 0) {
      suggestedTime = formatTime(schedule.firstPeak.start);
    } else if (index === 1) {
      suggestedTime = formatTime(schedule.firstPeak.end);
    } else {
      suggestedTime = formatTime(schedule.secondPeak.start);
    }
  }

  return {
    id: generatePriorityId(),
    title: '',
    session_type: 'deep_work',
    estimated_minutes: 45,
    suggested_time: suggestedTime,
    completed: false,
  };
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Session type options for the priority planner.
 */
export const SESSION_TYPE_OPTIONS: { key: FocusSession['session_type']; label: string }[] = [
  { key: 'deep_work', label: 'Deep Work' },
  { key: 'study', label: 'Study' },
  { key: 'creative', label: 'Creative' },
  { key: 'admin', label: 'Admin' },
  { key: 'practice', label: 'Practice' },
];

/**
 * Duration presets for priority estimation.
 */
export const DURATION_PRESETS = [25, 45, 90] as const;

/**
 * Calculate daily plan completion rate.
 */
export function getPlanCompletionRate(priorities: DailyPriority[]): number {
  if (priorities.length === 0) return 0;
  const completed = priorities.filter((p) => p.completed).length;
  return Math.round((completed / priorities.length) * 100);
}
