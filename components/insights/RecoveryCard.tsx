import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { computeRecoveryScore, getRecommendation, type RecoveryInput, type RecoveryBaselines } from '@/lib/recovery-score';

interface RecoveryCardProps {
  input: RecoveryInput;
  baselines?: RecoveryBaselines;
}

export function RecoveryCard({ input, baselines }: RecoveryCardProps) {
  const score = computeRecoveryScore(input, baselines);
  const rec = getRecommendation(score);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Recovery</Text>
          <Text style={[styles.score, { color: rec.color }]}>{score}</Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: rec.color + '20', borderColor: rec.color }]}>
            <Text style={[styles.badgeText, { color: rec.color }]}>{rec.label}</Text>
          </View>
          <Text style={styles.suggestion}>
            Suggested: {rec.focusSuggestion} min blocks
          </Text>
        </View>
      </View>
      <Text style={styles.message}>{rec.message}</Text>

      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: rec.color }]} />
      </View>

      <View style={styles.breakdown}>
        {input.hrvMean != null && (
          <Text style={styles.metric}>HRV: {Math.round(input.hrvMean)} ms</Text>
        )}
        <Text style={styles.metric}>Sleep: {Math.round(input.sleepMinutes / 60 * 10) / 10}h</Text>
        <Text style={styles.metric}>
          Consistency: {Math.round(input.sleepConsistency * 100)}%
        </Text>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  right: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  suggestion: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  bar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
