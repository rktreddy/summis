import { useState, useCallback } from 'react';
import {
  fetchTodayHealthData,
  requestHealthPermissions,
  checkAutoComplete,
  DEFAULT_RULES,
  type HealthData,
  type HealthSyncResult,
} from '@/lib/health-kit';

export function useHealthData() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestPermissions = useCallback(async () => {
    const granted = await requestHealthPermissions();
    setIsAvailable(granted);
    return granted;
  }, []);

  const syncHealthData = useCallback(async (): Promise<HealthSyncResult> => {
    setLoading(true);
    try {
      const result = await fetchTodayHealthData();
      if (result.data) {
        setHealthData(result.data);
        setIsAvailable(result.available);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAutoCompletableHabits = useCallback((): string[] => {
    if (!healthData) return [];
    return checkAutoComplete(healthData, DEFAULT_RULES);
  }, [healthData]);

  return { healthData, isAvailable, loading, requestPermissions, syncHealthData, getAutoCompletableHabits };
}
