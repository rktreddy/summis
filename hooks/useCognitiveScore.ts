import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { computeHygieneScore } from '@/lib/hygiene-engine';
import type { CognitiveScore } from '@/types/summis';

/** Format a Date as YYYY-MM-DD in local timezone. */
function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get an array of YYYY-MM-DD strings for the last N days (inclusive of today). */
function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(toDateString(d));
  }
  return days;
}

/**
 * Compute a single day's cognitive score from available data.
 *
 * Formula (from CLAUDE.md):
 *   Sprint completion  30% — completed / target
 *   Focus quality      30% — avg self-reported 1-5 → 0-100
 *   Hygiene compliance 25% — practices followed / active practices
 *   MIT completion     15% — MITs completed / MITs set
 */
interface DayInput {
  date: string;
  completedSprints: number;
  dailyTarget: number;
  avgFocusQuality: number | null; // 1-5 scale, null if no sprints
  hygieneScore: number;           // 0-100 from computeHygieneScore
  mitsSet: number;
  mitsCompleted: number;
}

function computeDayScore(input: DayInput): CognitiveScore {
  const sprintScore = input.dailyTarget > 0
    ? Math.min(Math.round((input.completedSprints / input.dailyTarget) * 100), 100)
    : 0;

  const focusQuality = input.avgFocusQuality !== null
    ? Math.round(input.avgFocusQuality * 20) // 1-5 → 20-100
    : 0;

  const mitScore = input.mitsSet > 0
    ? Math.round((input.mitsCompleted / input.mitsSet) * 100)
    : 0;

  const consistencyScore = input.completedSprints > 0 ? 100 : 0;

  const overallScore = Math.min(100, Math.round(
    sprintScore * 0.3 + focusQuality * 0.3 + input.hygieneScore * 0.25 + mitScore * 0.15
  ));

  return {
    date: input.date,
    overallScore,
    sprintScore,
    hygieneScore: input.hygieneScore,
    consistencyScore,
    focusQuality,
  };
}

export function useCognitiveScore() {
  const sprints = useAppStore((s) => s.sprints);
  const mits = useAppStore((s) => s.mits);
  const hygieneConfigs = useAppStore((s) => s.hygieneConfigs);
  const hygieneLogs = useAppStore((s) => s.hygieneLogs);
  const profile = useAppStore((s) => s.profile);

  const dailyTarget = profile?.daily_sprint_target ?? 3;

  // Compute daily scores for last 30 days
  const dailyScores = useMemo(() => {
    const days = lastNDays(30);

    return days.map((date): CognitiveScore => {
      const daySprints = sprints.filter((s) => s.date === date && s.completed);
      const dayMITs = mits.filter((m) => m.date === date);

      // Only include sprints that have a focus quality rating (filter out nulls)
      const ratedSprints = daySprints.filter((s) => s.focus_quality !== null);
      const avgFocus = ratedSprints.length > 0
        ? ratedSprints.reduce((sum, s) => sum + (s.focus_quality as number), 0) / ratedSprints.length
        : null;

      const hygieneScore = computeHygieneScore(hygieneConfigs, hygieneLogs, date);

      return computeDayScore({
        date,
        completedSprints: daySprints.length,
        dailyTarget,
        avgFocusQuality: avgFocus,
        hygieneScore,
        mitsSet: dayMITs.length,
        mitsCompleted: dayMITs.filter((m) => m.completed).length,
      });
    });
  }, [sprints, mits, hygieneConfigs, hygieneLogs, dailyTarget]);

  // 7-day rolling average (last 7 entries)
  const last7 = useMemo(() => dailyScores.slice(-7), [dailyScores]);
  const avg7Day = useMemo(() => {
    const withData = last7.filter((s) => s.overallScore > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((sum, s) => sum + s.overallScore, 0) / withData.length);
  }, [last7]);

  // Previous 7-day average (days 8-14 ago) for delta
  const prev7 = useMemo(() => dailyScores.slice(-14, -7), [dailyScores]);
  const avgPrev7Day = useMemo(() => {
    const withData = prev7.filter((s) => s.overallScore > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((sum, s) => sum + s.overallScore, 0) / withData.length);
  }, [prev7]);

  // 30-day rolling average
  const avg30Day = useMemo(() => {
    const withData = dailyScores.filter((s) => s.overallScore > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((sum, s) => sum + s.overallScore, 0) / withData.length);
  }, [dailyScores]);

  const delta = avg7Day - avgPrev7Day;
  const trend: 'rising' | 'plateau' | 'declining' =
    delta > 5 ? 'rising' : delta < -5 ? 'declining' : 'plateau';

  return {
    dailyScores,
    last7Scores: last7,
    avg7Day,
    avg30Day,
    delta,
    trend,
  };
}
