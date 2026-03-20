import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { FocusSession } from '@/types';

export interface ExerciseDay {
  date: string;
  workoutMinutes: number;
}

interface ExerciseCognitionCardProps {
  exerciseDays: ExerciseDay[];
  focusSessions: FocusSession[];
}

/**
 * Compare average focus session duration on exercise days vs rest days.
 */
function computeComparison(exerciseDays: ExerciseDay[], focusSessions: FocusSession[]) {
  const exerciseDateSet = new Set(exerciseDays.map((d) => d.date));

  let exerciseFocusTotal = 0;
  let exerciseFocusCount = 0;
  let restFocusTotal = 0;
  let restFocusCount = 0;

  for (const session of focusSessions) {
    if (!session.completed) continue;
    const sessionDate = new Date(session.started_at).toISOString().split('T')[0];

    if (exerciseDateSet.has(sessionDate)) {
      exerciseFocusTotal += session.duration_minutes;
      exerciseFocusCount++;
    } else {
      restFocusTotal += session.duration_minutes;
      restFocusCount++;
    }
  }

  const exerciseAvg = exerciseFocusCount > 0 ? Math.round(exerciseFocusTotal / exerciseFocusCount) : 0;
  const restAvg = restFocusCount > 0 ? Math.round(restFocusTotal / restFocusCount) : 0;
  const pctDiff = restAvg > 0 ? Math.round(((exerciseAvg - restAvg) / restAvg) * 100) : 0;

  return {
    exerciseAvg,
    restAvg,
    pctDiff,
    exerciseDayCount: exerciseDateSet.size,
    restDayCount: new Set(
      focusSessions
        .filter((s) => s.completed && !exerciseDateSet.has(new Date(s.started_at).toISOString().split('T')[0]))
        .map((s) => new Date(s.started_at).toISOString().split('T')[0])
    ).size,
  };
}

export function ExerciseCognitionCard({ exerciseDays, focusSessions }: ExerciseCognitionCardProps) {
  if (exerciseDays.length === 0 || focusSessions.length === 0) return null;

  const data = computeComparison(exerciseDays, focusSessions);
  const maxVal = Math.max(data.exerciseAvg, data.restAvg, 1);

  return (
    <Card style={styles.container}>
      <Text style={styles.heading}>Exercise & Focus</Text>

      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Exercise Days</Text>
          <View style={styles.barTrack}>
            <View
              style={[styles.barFill, { width: `${(data.exerciseAvg / maxVal) * 100}%`, backgroundColor: Colors.success }]}
            />
          </View>
          <Text style={styles.barValue}>{data.exerciseAvg}</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Rest Days</Text>
          <View style={styles.barTrack}>
            <View
              style={[styles.barFill, { width: `${(data.restAvg / maxVal) * 100}%`, backgroundColor: Colors.textSecondary }]}
            />
          </View>
          <Text style={styles.barValue}>{data.restAvg}</Text>
        </View>
      </View>

      <Text style={styles.axisLabel}>Avg Focus Duration (min)</Text>

      {data.pctDiff !== 0 && (
        <Text style={[styles.insight, data.pctDiff > 0 && { color: Colors.success }]}>
          {data.pctDiff > 0
            ? `Your focus is ${data.pctDiff}% longer on days you exercise`
            : `Focus is ${Math.abs(data.pctDiff)}% shorter on exercise days — consider timing`
          }
        </Text>
      )}

      <Text style={styles.footnote}>
        Based on {data.exerciseDayCount} exercise days and {data.restDayCount} rest days
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  heading: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bars: {
    gap: 10,
    marginBottom: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  axisLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  insight: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  footnote: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
