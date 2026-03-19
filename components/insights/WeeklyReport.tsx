import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { PerformanceScore } from '@/types';

interface WeeklyReportProps {
  current: PerformanceScore;
  previous: PerformanceScore | null;
  delta: number | null;
}

function ScoreRow({
  label,
  score,
  prevScore,
}: {
  label: string;
  score: number | null;
  prevScore: number | null;
}) {
  const diff = score != null && prevScore != null ? score - prevScore : null;

  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreRight}>
        <Text style={styles.scoreValue}>{score ?? '—'}</Text>
        {diff != null && diff !== 0 && (
          <Text
            style={[
              styles.scoreDelta,
              { color: diff > 0 ? Colors.success : Colors.danger },
            ]}
          >
            {diff > 0 ? '+' : ''}{diff}
          </Text>
        )}
      </View>
    </View>
  );
}

export function WeeklyReport({ current, previous, delta }: WeeklyReportProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Report</Text>
        <Text style={styles.week}>
          Week of{' '}
          {new Date(current.week_start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.overallContainer}>
        <Text style={styles.overallScore}>{current.overall_score ?? 0}</Text>
        <Text style={styles.overallLabel}>Overall Score</Text>
        {delta != null && delta !== 0 && (
          <Text
            style={[
              styles.overallDelta,
              { color: delta > 0 ? Colors.success : Colors.danger },
            ]}
          >
            {delta > 0 ? '\u2191' : '\u2193'} {Math.abs(delta)} vs last week
          </Text>
        )}
      </View>

      <View style={styles.breakdown}>
        <ScoreRow
          label="Habits"
          score={current.habit_score}
          prevScore={previous?.habit_score ?? null}
        />
        <ScoreRow
          label="Focus"
          score={current.focus_score}
          prevScore={previous?.focus_score ?? null}
        />
        <ScoreRow
          label="Consistency"
          score={current.consistency_score}
          prevScore={previous?.consistency_score ?? null}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  week: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  overallContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overallScore: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.accent,
  },
  overallLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  overallDelta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  breakdown: {
    gap: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  scoreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreDelta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
