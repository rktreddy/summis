import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { HabitCorrelation } from '@/lib/correlation-engine';

interface CorrelationCardProps {
  correlation: HabitCorrelation;
}

const BADGE_COLORS: Record<string, string> = {
  strong: Colors.success,
  moderate: Colors.warning,
  weak: Colors.textSecondary,
};

export function CorrelationCard({ correlation: c }: CorrelationCardProps) {
  if (!c.isSignificant) return null;

  const badgeColor = BADGE_COLORS[c.strengthLabel] ?? Colors.textSecondary;
  const pctDiff = Math.round(Math.abs(c.correlation) * 100);
  const direction = c.direction === 'positive' ? 'higher' : 'lower';

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.habitName}>{c.habitName}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor + '25', borderColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{c.strengthLabel} link</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${Math.round(c.completionRate * 100)}%`, backgroundColor: badgeColor }]}
        />
      </View>
      <Text style={styles.completionLabel}>{Math.round(c.completionRate * 100)}% completion</Text>

      <Text style={styles.insight}>
        On days you complete this habit, your score is {pctDiff}% {direction} on average.
      </Text>

      <Text style={styles.fine}>
        r = {c.correlation.toFixed(2)} · {c.sampleSize} days of data
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 10,
  },
  insight: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  fine: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
});
