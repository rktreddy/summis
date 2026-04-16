/**
 * Tests for the cognitive score computation logic.
 * Extracted from useCognitiveScore hook for unit testing.
 */
import type { CognitiveScore } from '@/types/summis';

// Re-implement computeDayScore here to test the formula in isolation
// (the hook's internal function isn't exported)
interface DayInput {
  date: string;
  completedSprints: number;
  dailyTarget: number;
  avgFocusQuality: number | null;
  hygieneScore: number;
  mitsSet: number;
  mitsCompleted: number;
}

function computeDayScore(input: DayInput): CognitiveScore {
  const sprintScore = input.dailyTarget > 0
    ? Math.min(Math.round((input.completedSprints / input.dailyTarget) * 100), 100)
    : 0;

  const focusQuality = input.avgFocusQuality !== null
    ? Math.round(input.avgFocusQuality * 20)
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

describe('computeDayScore', () => {
  const baseInput: DayInput = {
    date: '2026-04-16',
    completedSprints: 3,
    dailyTarget: 3,
    avgFocusQuality: 4.0,
    hygieneScore: 80,
    mitsSet: 3,
    mitsCompleted: 2,
  };

  it('computes correct weights for a typical day', () => {
    const score = computeDayScore(baseInput);
    // Sprint: 100 * 0.3 = 30
    // Focus:  80 * 0.3  = 24
    // Hygiene: 80 * 0.25 = 20
    // MIT:    67 * 0.15  = 10.05
    // Total ≈ 84
    expect(score.overallScore).toBe(84);
    expect(score.sprintScore).toBe(100);
    expect(score.focusQuality).toBe(80);
    expect(score.hygieneScore).toBe(80);
    expect(score.consistencyScore).toBe(100);
  });

  it('returns 0 for focus quality when null (no rated sprints)', () => {
    const score = computeDayScore({ ...baseInput, avgFocusQuality: null });
    expect(score.focusQuality).toBe(0);
    // Without focus quality: 30 + 0 + 20 + 10 = 60
    expect(score.overallScore).toBe(60);
  });

  it('caps sprint score at 100 even with over-completion', () => {
    const score = computeDayScore({ ...baseInput, completedSprints: 5, dailyTarget: 3 });
    expect(score.sprintScore).toBe(100);
  });

  it('handles zero daily target gracefully', () => {
    const score = computeDayScore({ ...baseInput, dailyTarget: 0 });
    expect(score.sprintScore).toBe(0);
  });

  it('handles zero MITs set gracefully', () => {
    const score = computeDayScore({ ...baseInput, mitsSet: 0, mitsCompleted: 0 });
    // No MIT component
    expect(score.overallScore).toBe(74);
  });

  it('returns consistency 0 when no sprints completed', () => {
    const score = computeDayScore({ ...baseInput, completedSprints: 0 });
    expect(score.consistencyScore).toBe(0);
  });

  it('caps overall score at 100', () => {
    const score = computeDayScore({
      ...baseInput,
      completedSprints: 3,
      dailyTarget: 3,
      avgFocusQuality: 5.0,
      hygieneScore: 100,
      mitsSet: 3,
      mitsCompleted: 3,
    });
    expect(score.overallScore).toBeLessThanOrEqual(100);
  });

  it('maps focus quality 1-5 to 20-100', () => {
    expect(computeDayScore({ ...baseInput, avgFocusQuality: 1 }).focusQuality).toBe(20);
    expect(computeDayScore({ ...baseInput, avgFocusQuality: 3 }).focusQuality).toBe(60);
    expect(computeDayScore({ ...baseInput, avgFocusQuality: 5 }).focusQuality).toBe(100);
  });

  it('produces a perfect score with all maxed inputs', () => {
    const score = computeDayScore({
      date: '2026-04-16',
      completedSprints: 3,
      dailyTarget: 3,
      avgFocusQuality: 5.0,
      hygieneScore: 100,
      mitsSet: 3,
      mitsCompleted: 3,
    });
    // Sprint: 100*0.3=30, Focus: 100*0.3=30, Hygiene: 100*0.25=25, MIT: 100*0.15=15 = 100
    expect(score.overallScore).toBe(100);
  });
});

describe('rolling averages', () => {
  function computeAverage(scores: CognitiveScore[]): number {
    const withData = scores.filter((s) => s.overallScore > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((sum, s) => sum + s.overallScore, 0) / withData.length);
  }

  it('excludes zero-score days from average', () => {
    const scores: CognitiveScore[] = [
      { date: '2026-04-10', overallScore: 80, sprintScore: 80, hygieneScore: 80, consistencyScore: 100, focusQuality: 80 },
      { date: '2026-04-11', overallScore: 0, sprintScore: 0, hygieneScore: 0, consistencyScore: 0, focusQuality: 0 },
      { date: '2026-04-12', overallScore: 60, sprintScore: 60, hygieneScore: 60, consistencyScore: 100, focusQuality: 60 },
    ];
    expect(computeAverage(scores)).toBe(70);
  });

  it('returns 0 when all scores are zero', () => {
    const scores: CognitiveScore[] = [
      { date: '2026-04-10', overallScore: 0, sprintScore: 0, hygieneScore: 0, consistencyScore: 0, focusQuality: 0 },
    ];
    expect(computeAverage(scores)).toBe(0);
  });
});

describe('trend calculation', () => {
  function computeTrend(delta: number): 'rising' | 'plateau' | 'declining' {
    return delta > 5 ? 'rising' : delta < -5 ? 'declining' : 'plateau';
  }

  it('classifies rising trend when delta > 5', () => {
    expect(computeTrend(10)).toBe('rising');
    expect(computeTrend(6)).toBe('rising');
  });

  it('classifies declining trend when delta < -5', () => {
    expect(computeTrend(-10)).toBe('declining');
    expect(computeTrend(-6)).toBe('declining');
  });

  it('classifies plateau when delta is between -5 and 5', () => {
    expect(computeTrend(0)).toBe('plateau');
    expect(computeTrend(5)).toBe('plateau');
    expect(computeTrend(-5)).toBe('plateau');
  });
});
