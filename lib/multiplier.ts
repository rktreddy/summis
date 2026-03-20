import type { HabitWithCompletions, FocusSession } from '@/types';

export interface DomainMultiplier {
  domain: 'sleep' | 'exercise' | 'focus' | 'habits' | 'recovery';
  label: string;
  multiplier: number;
  trend: 'up' | 'flat' | 'down';
  dataPoints: number;
}

export interface MultiplierResult {
  domains: DomainMultiplier[];
  totalMultiplier: number;
  projectedAnnual: number;
  daysToTenX: number | null;
}

const DOMAIN_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  exercise: 'Exercise',
  focus: 'Focus',
  habits: 'Habits',
  recovery: 'Recovery',
};

const CATEGORY_TO_DOMAIN: Record<string, string> = {
  sleep: 'sleep',
  exercise: 'exercise',
  recovery: 'recovery',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute a domain multiplier by comparing recent performance to baseline.
 * Returns 1.0 if no improvement, up to 2.0x cap.
 */
function computeRatio(recent: number, baseline: number): number {
  if (baseline <= 0) return 1.0;
  return clamp(recent / baseline, 1.0, 2.0);
}

/**
 * Determine trend from two values.
 */
function getTrend(recent: number, baseline: number): 'up' | 'flat' | 'down' {
  const diff = recent - baseline;
  if (diff > 0.05) return 'up';
  if (diff < -0.05) return 'down';
  return 'flat';
}

/**
 * Compute completion rate for habits in a category over a date range.
 */
function categoryCompletionRate(
  habits: HabitWithCompletions[],
  category: string,
  startDate: Date,
  endDate: Date,
  days: number
): { rate: number; count: number } {
  const categoryHabits = habits.filter((h) => h.category === category);
  if (categoryHabits.length === 0) return { rate: 0, count: 0 };

  let totalCompleted = 0;
  for (const habit of categoryHabits) {
    const completions = habit.completions.filter((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });
    const uniqueDays = new Set(
      completions.map((c) => new Date(c.completed_at).toDateString())
    );
    totalCompleted += uniqueDays.size;
  }

  const totalPossible = categoryHabits.length * days;
  return {
    rate: totalPossible > 0 ? totalCompleted / totalPossible : 0,
    count: categoryHabits.length,
  };
}

/**
 * Compute multipliers across all performance domains.
 *
 * Compares the last 7 days against the first 7 days of a 30-day window.
 * Each domain multiplier is capped at 2.0x and floored at 1.0x.
 */
export function computeMultipliers(
  habits: HabitWithCompletions[],
  focusSessions: FocusSession[]
): MultiplierResult {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Baseline: days 30-24 ago. Recent: last 7 days.
  const baselineStart = new Date(now);
  baselineStart.setDate(baselineStart.getDate() - 30);
  const baselineEnd = new Date(now);
  baselineEnd.setDate(baselineEnd.getDate() - 23);

  const recentStart = new Date(now);
  recentStart.setDate(recentStart.getDate() - 7);

  const domains: DomainMultiplier[] = [];

  // Sleep domain
  const sleepBaseline = categoryCompletionRate(habits, 'sleep', baselineStart, baselineEnd, 7);
  const sleepRecent = categoryCompletionRate(habits, 'sleep', recentStart, now, 7);
  domains.push({
    domain: 'sleep',
    label: DOMAIN_LABELS.sleep,
    multiplier: sleepBaseline.count > 0 ? computeRatio(sleepRecent.rate, sleepBaseline.rate || 0.5) : 1.0,
    trend: sleepBaseline.count > 0 ? getTrend(sleepRecent.rate, sleepBaseline.rate) : 'flat',
    dataPoints: sleepRecent.count * 7,
  });

  // Exercise domain
  const exerciseBaseline = categoryCompletionRate(habits, 'exercise', baselineStart, baselineEnd, 7);
  const exerciseRecent = categoryCompletionRate(habits, 'exercise', recentStart, now, 7);
  domains.push({
    domain: 'exercise',
    label: DOMAIN_LABELS.exercise,
    multiplier: exerciseBaseline.count > 0 ? computeRatio(exerciseRecent.rate, exerciseBaseline.rate || 0.5) : 1.0,
    trend: exerciseBaseline.count > 0 ? getTrend(exerciseRecent.rate, exerciseBaseline.rate) : 'flat',
    dataPoints: exerciseRecent.count * 7,
  });

  // Focus domain: average daily focus minutes
  const baselineSessions = focusSessions.filter((s) => {
    const t = new Date(s.started_at).getTime();
    return t >= baselineStart.getTime() && t <= baselineEnd.getTime() && s.completed;
  });
  const recentSessions = focusSessions.filter((s) => {
    const t = new Date(s.started_at).getTime();
    return t >= recentStart.getTime() && s.completed;
  });
  const baselineFocusAvg = baselineSessions.length > 0
    ? baselineSessions.reduce((s, f) => s + f.duration_minutes, 0) / 7
    : 0;
  const recentFocusAvg = recentSessions.length > 0
    ? recentSessions.reduce((s, f) => s + f.duration_minutes, 0) / 7
    : 0;
  domains.push({
    domain: 'focus',
    label: DOMAIN_LABELS.focus,
    multiplier: baselineFocusAvg > 0 ? computeRatio(recentFocusAvg, baselineFocusAvg) : 1.0,
    trend: getTrend(recentFocusAvg, baselineFocusAvg),
    dataPoints: recentSessions.length,
  });

  // Habits domain: overall completion rate
  const allBaseline = categoryCompletionRate(habits, '', baselineStart, baselineEnd, 7);
  const allRecent = categoryCompletionRate(habits, '', recentStart, now, 7);
  // For 'habits' domain, count all habits regardless of category
  let habitsBaselineRate = 0;
  let habitsRecentRate = 0;
  let habitsCount = habits.length;
  if (habitsCount > 0) {
    let baseCompleted = 0;
    let recentCompleted = 0;
    for (const h of habits) {
      const bc = h.completions.filter((c) => {
        const t = new Date(c.completed_at).getTime();
        return t >= baselineStart.getTime() && t <= baselineEnd.getTime();
      });
      baseCompleted += new Set(bc.map((c) => new Date(c.completed_at).toDateString())).size;
      const rc = h.completions.filter((c) => {
        const t = new Date(c.completed_at).getTime();
        return t >= recentStart.getTime();
      });
      recentCompleted += new Set(rc.map((c) => new Date(c.completed_at).toDateString())).size;
    }
    habitsBaselineRate = baseCompleted / (habitsCount * 7);
    habitsRecentRate = recentCompleted / (habitsCount * 7);
  }
  domains.push({
    domain: 'habits',
    label: DOMAIN_LABELS.habits,
    multiplier: habitsBaselineRate > 0 ? computeRatio(habitsRecentRate, habitsBaselineRate) : 1.0,
    trend: getTrend(habitsRecentRate, habitsBaselineRate),
    dataPoints: habitsCount * 7,
  });

  // Recovery domain
  const recoveryBaseline = categoryCompletionRate(habits, 'recovery', baselineStart, baselineEnd, 7);
  const recoveryRecent = categoryCompletionRate(habits, 'recovery', recentStart, now, 7);
  domains.push({
    domain: 'recovery',
    label: DOMAIN_LABELS.recovery,
    multiplier: recoveryBaseline.count > 0 ? computeRatio(recoveryRecent.rate, recoveryBaseline.rate || 0.5) : 1.0,
    trend: recoveryBaseline.count > 0 ? getTrend(recoveryRecent.rate, recoveryBaseline.rate) : 'flat',
    dataPoints: recoveryRecent.count * 7,
  });

  const totalMultiplier = domains.reduce((product, d) => product * d.multiplier, 1);
  const projectedAnnual = totalMultiplier * Math.pow(1.01, 365);

  // Days to 10x: solve totalMultiplier * 1.01^d = 10
  // d = ln(10/totalMultiplier) / ln(1.01)
  let daysToTenX: number | null = null;
  if (totalMultiplier > 1.0) {
    const ratio = 10 / totalMultiplier;
    if (ratio > 1) {
      daysToTenX = Math.ceil(Math.log(ratio) / Math.log(1.01));
    } else {
      daysToTenX = 0; // Already at 10x+
    }
  }

  return { domains, totalMultiplier, projectedAnnual, daysToTenX };
}
