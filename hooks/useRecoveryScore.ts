import { useState, useCallback } from 'react';
import { fetchTodayHealthData } from '@/lib/health-kit';
import {
  computeRecoveryScore,
  getRecommendation,
  type RecoveryInput,
  type RecoveryBaselines,
  type RecoveryRecommendation,
} from '@/lib/recovery-score';

export function useRecoveryScore(baselines?: RecoveryBaselines) {
  const [score, setScore] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<RecoveryRecommendation | null>(null);
  const [input, setInput] = useState<RecoveryInput | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchTodayHealthData();

      if (result.available && result.data) {
        const recoveryInput: RecoveryInput = {
          hrvMean: result.data.hrvMean,
          sleepMinutes: result.data.sleepMinutes,
          sleepConsistency: 0.8, // TODO: compute from wake_time vs profile.wake_time
          restingHeartRate: result.data.restingHeartRate,
        };
        const s = computeRecoveryScore(recoveryInput, baselines);
        setScore(s);
        setRecommendation(getRecommendation(s));
        setInput(recoveryInput);
      }
    } finally {
      setLoading(false);
    }
  }, [baselines]);

  /**
   * Manually set recovery input (for demo/testing or manual entry).
   */
  const setManualInput = useCallback((manualInput: RecoveryInput) => {
    const s = computeRecoveryScore(manualInput, baselines);
    setScore(s);
    setRecommendation(getRecommendation(s));
    setInput(manualInput);
  }, [baselines]);

  return { score, recommendation, input, loading, compute, setManualInput };
}
