import type { HabitWithCompletions, DailyScore } from '@/types';
import type { HygieneConfig, HygieneLog, Sprint, HygieneCorrelation } from '@/types/summis';

export interface HabitCorrelation {
  habitId: string;
  habitName: string;
  completionRate: number;
  correlation: number;
  targetMetric: 'focus' | 'habit' | 'consistency' | 'overall';
  sampleSize: number;
  isSignificant: boolean;
  direction: 'positive' | 'negative' | 'none';
  strengthLabel: 'strong' | 'moderate' | 'weak';
  highCompleter: boolean;
  lowCompleter: boolean;
}

export function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  );
  return den === 0 ? 0 : num / den;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computeHabitCorrelations(
  habits: HabitWithCompletions[],
  scores: DailyScore[],
  windowDays = 30
): HabitCorrelation[] {
  const results: HabitCorrelation[] = [];
  const recentScores = scores.slice(-windowDays);

  for (const habit of habits) {
    const completionVec: number[] = [];
    const overallVec: number[] = [];

    for (const dayScore of recentScores) {
      const scoreDate = new Date(dayScore.date);
      const completed = habit.completions.some((c) =>
        isSameDay(new Date(c.completed_at), scoreDate)
      );
      completionVec.push(completed ? 1 : 0);
      overallVec.push(dayScore.overallScore);
    }

    const n = completionVec.length;
    if (n < 2) continue;

    const r = pearson(completionVec, overallVec);
    const completionRate = completionVec.reduce((a, b) => a + b, 0) / n;
    const highCompleter = completionRate > 0.9;
    const lowCompleter = completionRate < 0.1;

    results.push({
      habitId: habit.id,
      habitName: habit.title,
      completionRate,
      correlation: r,
      targetMetric: 'overall',
      sampleSize: n,
      isSignificant: n >= 20 && Math.abs(r) > 0.25 && !highCompleter && !lowCompleter,
      direction: r > 0.1 ? 'positive' : r < -0.1 ? 'negative' : 'none',
      strengthLabel: Math.abs(r) >= 0.5 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak',
      highCompleter,
      lowCompleter,
    });
  }

  return results.sort((a, b) => {
    if (a.isSignificant !== b.isSignificant) return b.isSignificant ? 1 : -1;
    return Math.abs(b.correlation) - Math.abs(a.correlation);
  });
}

/**
 * Compute correlations between hygiene practice compliance and focus quality.
 * For each active hygiene practice, correlates binary compliance (1/0) with
 * average sprint focus quality on that day.
 *
 * Only includes days with at least one completed sprint (otherwise focus quality is undefined).
 * Minimum 20 data points and |r| > 0.25 for significance.
 */
export function computeHygieneCorrelations(
  hygieneConfigs: HygieneConfig[],
  hygieneLogs: HygieneLog[],
  sprints: Sprint[],
  windowDays = 30
): HygieneCorrelation[] {
  const results: HygieneCorrelation[] = [];
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Filter to active practices only
  const activePractices = hygieneConfigs.filter((config) => config.is_active);

  for (const config of activePractices) {
    const complianceVec: number[] = [];
    const focusVec: number[] = [];
    const processedDates: Set<string> = new Set();

    // Get all sprint dates in the window
    const sprintsInWindow = sprints.filter((sprint) => {
      const sprintDate = new Date(sprint.date);
      return sprintDate >= windowStart && sprintDate <= now;
    });

    // For each day that has at least one sprint, compute focus quality and compliance
    for (const sprint of sprintsInWindow) {
      const sprintDate = sprint.date; // Assuming ISO date string YYYY-MM-DD

      // Skip if we already processed this date
      if (processedDates.has(sprintDate)) continue;
      processedDates.add(sprintDate);

      // Find all sprints on this date
      const daysSprints = sprintsInWindow.filter((s) => s.date === sprintDate);

      // Calculate average focus quality for the day (only completed sprints with ratings)
      const focusRatings = daysSprints
        .filter((s) => s.focus_quality !== null)
        .map((s) => s.focus_quality as number);

      if (focusRatings.length === 0) {
        // No focus quality data for this day, skip it
        continue;
      }

      const avgFocusQuality = focusRatings.reduce((a, b) => a + b, 0) / focusRatings.length;

      // Check compliance for this practice on this date
      const logEntry = hygieneLogs.find(
        (log) =>
          log.practice === config.practice &&
          log.date === sprintDate &&
          log.user_id === config.user_id
      );
      const compliant = logEntry ? logEntry.compliant : false;

      complianceVec.push(compliant ? 1 : 0);
      focusVec.push(avgFocusQuality);
    }

    const n = complianceVec.length;
    if (n < 2) continue;

    const r = pearson(complianceVec, focusVec);
    const complianceRate = complianceVec.reduce((a, b) => a + b, 0) / n;
    const highCompleter = complianceRate > 0.9;
    const lowCompleter = complianceRate < 0.1;
    const isSignificant = n >= 20 && Math.abs(r) > 0.25 && !highCompleter && !lowCompleter;

    // Calculate insight text with percentage
    let insightText = '';
    if (highCompleter) {
      insightText = 'You follow this practice too consistently to measure its isolated impact — that\'s a good sign.';
    } else if (lowCompleter) {
      insightText = 'Follow this practice more consistently to unlock its impact score.';
    } else if (isSignificant) {
      // Calculate percentage difference in focus quality
      const compliantDays = complianceVec
        .map((c, i) => (c === 1 ? focusVec[i] : null))
        .filter((v) => v !== null) as number[];
      const nonCompliantDays = complianceVec
        .map((c, i) => (c === 0 ? focusVec[i] : null))
        .filter((v) => v !== null) as number[];

      const avgCompliant = compliantDays.length > 0 ? compliantDays.reduce((a, b) => a + b, 0) / compliantDays.length : 0;
      const avgNonCompliant = nonCompliantDays.length > 0 ? nonCompliantDays.reduce((a, b) => a + b, 0) / nonCompliantDays.length : 0;

      const percentDiff = avgNonCompliant !== 0 ? Math.round(((avgCompliant - avgNonCompliant) / avgNonCompliant) * 100) : 0;

      if (r > 0.1) {
        insightText = `On days you ${config.label}, your focus quality tends to be ${Math.abs(percentDiff)}% higher.`;
      } else if (r < -0.1) {
        insightText = `On days you ${config.label}, your focus quality tends to be ${Math.abs(percentDiff)}% lower.`;
      } else {
        insightText = 'No clear link detected yet. Keep tracking for more data.';
      }
    } else {
      insightText = 'No clear link detected yet. Keep tracking for more data.';
    }

    results.push({
      practice: config.practice,
      practiceLabel: config.label,
      complianceRate,
      correlation: r,
      sampleSize: n,
      isSignificant,
      direction: r > 0.1 ? 'positive' : r < -0.1 ? 'negative' : 'none',
      strengthLabel: Math.abs(r) >= 0.5 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak',
      highCompleter,
      lowCompleter,
      insightText,
    });
  }

  // Sort: significant first, then by absolute correlation strength
  return results.sort((a, b) => {
    if (a.isSignificant !== b.isSignificant) return b.isSignificant ? 1 : -1;
    return Math.abs(b.correlation) - Math.abs(a.correlation);
  });
}
