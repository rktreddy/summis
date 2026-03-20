// Health data integration for iOS (HealthKit) and Android (Google Fit)
// Requires: expo-health (install separately)
//   npx expo install expo-health

export interface HealthData {
  steps: number;
  sleepMinutes: number;
  workoutMinutes: number;
  activeCalories: number;
  hrvMean: number | null;
  restingHeartRate: number | null;
}

export interface WorkoutEntry {
  date: string;        // YYYY-MM-DD
  type: string;        // 'running', 'cycling', 'strength', etc.
  durationMinutes: number;
  caloriesBurned: number;
}

export interface HealthSyncResult {
  available: boolean;
  data: HealthData | null;
  error: string | null;
}

export async function requestHealthPermissions(): Promise<boolean> {
  // TODO: Uncomment when expo-health is installed
  // const { requestPermissionsAsync } = await import('expo-health');
  // const { granted } = await requestPermissionsAsync([
  //   'sleepAnalysis', 'stepCount', 'workoutMinutes', 'activeEnergyBurned',
  // ]);
  // return granted;
  console.warn('Health permissions not available — expo-health not installed');
  return false;
}

export async function fetchTodayHealthData(): Promise<HealthSyncResult> {
  // TODO: Implement when expo-health is installed
  return {
    available: false,
    data: null,
    error: 'Health integration not yet configured. Install expo-health to enable.',
  };
}

/**
 * Fetch workouts since a given date.
 * Returns workout entries with date, type, duration, and calories.
 */
export async function fetchWorkouts(_since: Date): Promise<WorkoutEntry[]> {
  // TODO: Implement when expo-health is installed
  // const { getWorkoutsAsync } = await import('expo-health');
  // return getWorkoutsAsync(since).map(w => ({
  //   date: w.startDate.toISOString().split('T')[0],
  //   type: w.workoutType,
  //   durationMinutes: w.duration / 60,
  //   caloriesBurned: w.totalEnergyBurned ?? 0,
  // }));
  return [];
}

export interface AutoCompleteRule {
  habitTitle: string;
  metric: keyof HealthData;
  threshold: number;
  comparison: 'gte' | 'lte';
}

export const DEFAULT_RULES: AutoCompleteRule[] = [
  { habitTitle: 'Daily Walk', metric: 'steps', threshold: 8000, comparison: 'gte' },
  { habitTitle: 'Morning Movement', metric: 'workoutMinutes', threshold: 20, comparison: 'gte' },
  { habitTitle: 'Zone 2 Cardio', metric: 'workoutMinutes', threshold: 30, comparison: 'gte' },
];

export function checkAutoComplete(
  healthData: HealthData,
  rules: AutoCompleteRule[]
): string[] {
  return rules
    .filter((rule) => {
      const value = healthData[rule.metric];
      if (value == null) return false;
      return rule.comparison === 'gte' ? value >= rule.threshold : value <= rule.threshold;
    })
    .map((rule) => rule.habitTitle);
}
