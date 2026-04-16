import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { computeHygieneCorrelations } from '@/lib/correlation-engine';
import type { HygieneCorrelation } from '@/types/summis';

/**
 * Compute hygiene practice × focus quality correlations.
 * Returns top 3 significant correlations, sorted by strength.
 * Requires at least 30 days of data and 20 data points per practice.
 */
export function useHygieneCorrelations(): {
  correlations: HygieneCorrelation[];
  hasEnoughData: boolean;
  totalDataDays: number;
} {
  const sprints = useAppStore((s) => s.sprints);
  const hygieneConfigs = useAppStore((s) => s.hygieneConfigs);
  const hygieneLogs = useAppStore((s) => s.hygieneLogs);

  const completedSprints = useMemo(
    () => sprints.filter((s) => s.completed),
    [sprints]
  );

  // Count unique days with completed sprints
  const totalDataDays = useMemo(() => {
    const dates = new Set(completedSprints.map((s) => s.date));
    return dates.size;
  }, [completedSprints]);

  const hasEnoughData = totalDataDays >= 30;

  const correlations = useMemo(() => {
    if (!hasEnoughData) return [];
    const all = computeHygieneCorrelations(hygieneConfigs, hygieneLogs, sprints, 90);
    // Return top 3 significant correlations
    return all.filter((c) => c.isSignificant).slice(0, 3);
  }, [hasEnoughData, hygieneConfigs, hygieneLogs, sprints]);

  return { correlations, hasEnoughData, totalDataDays };
}
