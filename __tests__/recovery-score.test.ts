import { computeRecoveryScore, getRecommendation, type RecoveryInput, type RecoveryBaselines } from '../lib/recovery-score';

const baselines: RecoveryBaselines = {
  avgHrv: 50,
  avgSleep: 420,
  avgRhr: 65,
};

describe('computeRecoveryScore', () => {
  it('returns 100 when all inputs match or exceed baselines', () => {
    const input: RecoveryInput = {
      hrvMean: 60,        // above baseline
      sleepMinutes: 480,  // 8h (max)
      sleepConsistency: 1.0,
      restingHeartRate: 60,
    };
    expect(computeRecoveryScore(input, baselines)).toBe(100);
  });

  it('returns lower score with worse inputs', () => {
    const good: RecoveryInput = {
      hrvMean: 50,
      sleepMinutes: 480,
      sleepConsistency: 1.0,
      restingHeartRate: 65,
    };
    const bad: RecoveryInput = {
      hrvMean: 25,
      sleepMinutes: 300,
      sleepConsistency: 0.5,
      restingHeartRate: 80,
    };
    const goodScore = computeRecoveryScore(good, baselines);
    const badScore = computeRecoveryScore(bad, baselines);
    expect(goodScore).toBeGreaterThan(badScore);
  });

  it('falls back to sleep-only scoring when HRV is null', () => {
    const withHrv: RecoveryInput = {
      hrvMean: 50,
      sleepMinutes: 480,
      sleepConsistency: 1.0,
      restingHeartRate: 65,
    };
    const withoutHrv: RecoveryInput = {
      hrvMean: null,
      sleepMinutes: 480,
      sleepConsistency: 1.0,
      restingHeartRate: null,
    };
    const scoreWith = computeRecoveryScore(withHrv, baselines);
    const scoreWithout = computeRecoveryScore(withoutHrv, baselines);
    // Both should be high since sleep is maxed
    expect(scoreWith).toBeGreaterThanOrEqual(90);
    expect(scoreWithout).toBeGreaterThanOrEqual(90);
  });

  it('returns 0 with zero inputs', () => {
    const input: RecoveryInput = {
      hrvMean: 0,
      sleepMinutes: 0,
      sleepConsistency: 0,
      restingHeartRate: 100,
    };
    expect(computeRecoveryScore(input, baselines)).toBe(0);
  });

  it('clamps scores to 0-100 range', () => {
    const extreme: RecoveryInput = {
      hrvMean: 200,       // way above baseline
      sleepMinutes: 1000, // impossible
      sleepConsistency: 2.0,
      restingHeartRate: 40,
    };
    expect(computeRecoveryScore(extreme, baselines)).toBeLessThanOrEqual(100);

    const negative: RecoveryInput = {
      hrvMean: -10,
      sleepMinutes: -100,
      sleepConsistency: -1,
      restingHeartRate: 200,
    };
    expect(computeRecoveryScore(negative, baselines)).toBeGreaterThanOrEqual(0);
  });
});

describe('getRecommendation', () => {
  it('returns Excellent for score >= 80', () => {
    expect(getRecommendation(85).label).toBe('Excellent');
    expect(getRecommendation(100).label).toBe('Excellent');
  });

  it('returns Good for score 60-79', () => {
    expect(getRecommendation(70).label).toBe('Good');
    expect(getRecommendation(60).label).toBe('Good');
  });

  it('returns Moderate for score 40-59', () => {
    expect(getRecommendation(50).label).toBe('Moderate');
    expect(getRecommendation(40).label).toBe('Moderate');
  });

  it('returns Low for score < 40', () => {
    expect(getRecommendation(30).label).toBe('Low');
    expect(getRecommendation(0).label).toBe('Low');
  });

  it('suggests 90-min blocks for excellent recovery', () => {
    expect(getRecommendation(90).focusSuggestion).toBe(90);
  });

  it('suggests 25-min blocks for low recovery', () => {
    expect(getRecommendation(20).focusSuggestion).toBe(25);
  });
});
