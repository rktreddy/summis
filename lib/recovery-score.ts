import { Colors } from '@/constants/Colors';

export interface RecoveryInput {
  hrvMean: number | null;
  sleepMinutes: number;
  sleepConsistency: number; // 0-1, how close wake time was to usual
  restingHeartRate: number | null;
}

export interface RecoveryBaselines {
  avgHrv: number;
  avgSleep: number;  // minutes
  avgRhr: number;
}

const DEFAULT_BASELINES: RecoveryBaselines = {
  avgHrv: 50,     // ms — population average
  avgSleep: 420,  // 7 hours
  avgRhr: 65,     // bpm
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute a recovery score 0-100 from health inputs.
 *
 * Formula:
 * - HRV component (40%): (todayHRV / baselineHRV) × 100
 * - Sleep component (40%): (sleepMinutes / 480) × 100 (8h = 100)
 * - Consistency component (20%): sleepConsistency × 100
 *
 * If HRV unavailable: reweight to 60% sleep, 40% consistency.
 */
export function computeRecoveryScore(
  input: RecoveryInput,
  baselines: RecoveryBaselines = DEFAULT_BASELINES
): number {
  const sleepScore = clamp((input.sleepMinutes / 480) * 100, 0, 100);
  const consistencyScore = clamp(input.sleepConsistency * 100, 0, 100);

  if (input.hrvMean == null) {
    // No HRV data — reweight
    return Math.round(sleepScore * 0.6 + consistencyScore * 0.4);
  }

  const hrvBaseline = baselines.avgHrv > 0 ? baselines.avgHrv : DEFAULT_BASELINES.avgHrv;
  const hrvScore = clamp((input.hrvMean / hrvBaseline) * 100, 0, 100);

  return Math.round(hrvScore * 0.4 + sleepScore * 0.4 + consistencyScore * 0.2);
}

export interface RecoveryRecommendation {
  label: 'Excellent' | 'Good' | 'Moderate' | 'Low';
  color: string;
  focusSuggestion: number; // recommended focus block in minutes
  message: string;
}

/**
 * Get a recommendation based on the recovery score.
 */
export function getRecommendation(score: number): RecoveryRecommendation {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: Colors.success,
      focusSuggestion: 90,
      message: 'You\'re fully recovered. Great day for a 90-min deep work block.',
    };
  }
  if (score >= 60) {
    return {
      label: 'Good',
      color: Colors.accent,
      focusSuggestion: 45,
      message: 'Solid recovery. Aim for 45-min focus sessions today.',
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate',
      color: Colors.warning,
      focusSuggestion: 25,
      message: 'Recovery is moderate. Stick to 25-min blocks and take extra breaks.',
    };
  }
  return {
    label: 'Low',
    color: Colors.danger,
    focusSuggestion: 25,
    message: 'Recovery is low. Prioritize rest — light work only today.',
  };
}
