import type { HabitCompletion } from '@/types';

/**
 * Returns today's date as a YYYY-MM-DD string in local timezone.
 * Use this instead of inline `new Date().toISOString().split('T')[0]`
 * which returns UTC date (can differ from local date near midnight).
 */
export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns the start of today (midnight) as a Date.
 */
export function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the start of tomorrow (midnight) as a Date.
 */
export function getStartOfTomorrow(): Date {
  const d = getStartOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Checks whether a completion timestamp falls within today.
 */
export function isToday(completedAt: string): boolean {
  const t = new Date(completedAt).getTime();
  return t >= getStartOfToday().getTime() && t < getStartOfTomorrow().getTime();
}

/**
 * Checks whether a list of completions includes one from today.
 */
export function isCompletedToday(completions: HabitCompletion[]): boolean {
  return completions.some((c) => isToday(c.completed_at));
}

/**
 * Finds and returns today's completion from a list, or undefined if none.
 */
export function findTodayCompletion(completions: HabitCompletion[]): HabitCompletion | undefined {
  return completions.find((c) => isToday(c.completed_at));
}
