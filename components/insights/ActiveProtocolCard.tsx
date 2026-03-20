import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { getProtocolById, getProtocolProgress, type ActiveProtocol } from '@/lib/active-protocols';

interface ActiveProtocolCardProps {
  protocol: ActiveProtocol;
}

export function ActiveProtocolCard({ protocol }: ActiveProtocolCardProps) {
  const info = getProtocolById(protocol.protocol_id);
  const progress = getProtocolProgress(protocol);

  if (!info) return null;

  const scoreImproved = protocol.baseline_score != null && protocol.final_score != null
    ? protocol.final_score - protocol.baseline_score
    : null;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ACTIVE PROTOCOL</Text>
        </View>
        {progress.isComplete && (
          <Text style={styles.completeBadge}>{'\u2705'} Complete</Text>
        )}
      </View>

      <Text style={styles.title}>{info.title}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.dayLabel}>
          Day {progress.dayNumber} of {progress.totalDays}
        </Text>
        <Text style={styles.percentLabel}>{progress.percentComplete}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress.percentComplete}%` },
            progress.isComplete && { backgroundColor: Colors.success },
          ]}
        />
      </View>

      {protocol.baseline_score != null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Baseline score: {protocol.baseline_score}</Text>
          {protocol.final_score != null && scoreImproved != null && (
            <Text style={[styles.scoreLabel, { color: scoreImproved >= 0 ? Colors.success : Colors.danger }]}>
              Final: {protocol.final_score} ({scoreImproved >= 0 ? '+' : ''}{scoreImproved})
            </Text>
          )}
        </View>
      )}
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
    marginBottom: 8,
  },
  badge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  completeBadge: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  percentLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
