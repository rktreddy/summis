import type { HabitWithCompletions, DailyScore } from '@/types';

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
