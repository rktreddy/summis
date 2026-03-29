import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { computeHygieneScore } from '@/lib/hygiene-engine';
import { getTodayString } from '@/lib/date-utils';

export function useHygieneScore() {
  const hygieneConfigs = useAppStore((s) => s.hygieneConfigs);
  const hygieneLogs = useAppStore((s) => s.hygieneLogs);

  const todayStr = useMemo(() => getTodayString(), []);

  const score = useMemo(
    () => computeHygieneScore(hygieneConfigs, hygieneLogs, todayStr),
    [hygieneConfigs, hygieneLogs, todayStr]
  );

  const { activeCount, compliantCount, todayLogs } = useMemo(() => {
    const active = hygieneConfigs.filter((c) => c.is_active).length;
    const logs = hygieneLogs.filter((l) => l.date === todayStr);
    const compliant = logs.filter((l) => l.compliant).length;
    return { activeCount: active, compliantCount: compliant, todayLogs: logs };
  }, [hygieneConfigs, hygieneLogs, todayStr]);

  return {
    score,
    activeCount,
    compliantCount,
    todayLogs,
  };
}
