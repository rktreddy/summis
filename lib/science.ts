import type { HabitCompletion } from '@/types';

/**
 * Returns the first ultradian peak window (~2.5 hours after waking).
 * Based on research showing ~90-minute ultradian cycles.
 */
export function getNextPeakWindow(lastSleepTime: Date): Date {
  const peak = new Date(lastSleepTime);
  peak.setMinutes(peak.getMinutes() + 150); // 2.5 hours after waking
  return peak;
}

/**
 * Circadian alertness peak occurs 2-4 hours after waking.
 * Returns the peak time and optimal focus window duration (90 min).
 */
export function getAlertnessPeak(wakeTime: Date): { peak: Date; window: number } {
  const peak = new Date(wakeTime);
  peak.setHours(peak.getHours() + 3); // ~3 hours after waking
  return { peak, window: 90 };
}

/**
 * Measures how clustered habit completions are within 30-minute windows.
 * Habit stacking (doing habits back-to-back) improves adherence.
 * Returns 0-100.
 */
export function calculateHabitStackScore(completions: HabitCompletion[]): number {
  if (completions.length < 2) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  let clustered = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      new Date(sorted[i].completed_at).getTime() -
      new Date(sorted[i - 1].completed_at).getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    if (diff <= thirtyMinutes) {
      clustered++;
    }
  }

  return Math.round((clustered / (sorted.length - 1)) * 100);
}

/**
 * Weighted consistency score with recency bias.
 * More recent completions count more heavily.
 * Returns 0-100.
 */
export function calculateConsistencyScore(
  completions: HabitCompletion[],
  days: number
): number {
  if (days === 0) return 0;

  const now = new Date();
  let weightedSum = 0;
  let totalWeight = 0;

  for (let d = 0; d < days; d++) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - d);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const hasCompletion = completions.some((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    });

    // Recency weight: more recent days count more
    const weight = (days - d) / days;
    totalWeight += weight;
    if (hasCompletion) {
      weightedSum += weight;
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
}

/**
 * Counts consecutive days with at least one completion, going back from today.
 */
export function calculateStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  const completionDates = new Set(
    completions.map((c) => {
      const d = new Date(c.completed_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streak = 0;
  const today = new Date();

  for (let d = 0; d < 365; d++) {
    const check = new Date(today);
    check.setDate(check.getDate() - d);
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;

    if (completionDates.has(key)) {
      streak++;
    } else if (d === 0) {
      // Today hasn't been completed yet — that's ok, check yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}
