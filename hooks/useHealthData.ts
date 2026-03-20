import { useState, useCallback } from 'react';
import {
  fetchTodayHealthData,
  fetchWorkouts,
  requestHealthPermissions,
  checkAutoComplete,
  DEFAULT_RULES,
  type HealthData,
  type HealthSyncResult,
  type WorkoutEntry,
} from '@/lib/health-kit';

export function useHealthData() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
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

  const syncWorkouts = useCallback(async (since: Date) => {
    try {
      const entries = await fetchWorkouts(since);
      setWorkouts(entries);
      return entries;
    } catch {
      return [];
    }
  }, []);

  const getAutoCompletableHabits = useCallback((): string[] => {
    if (!healthData) return [];
    return checkAutoComplete(healthData, DEFAULT_RULES);
  }, [healthData]);

  return {
    healthData,
    workouts,
    isAvailable,
    loading,
    requestPermissions,
    syncHealthData,
    syncWorkouts,
    getAutoCompletableHabits,
  };
}
