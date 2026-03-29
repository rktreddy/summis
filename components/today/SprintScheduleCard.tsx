import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { Sprint } from '@/types/summis';

interface SprintScheduleCardProps {
  completedToday: Sprint[];
  dailyTarget: number;
  sprintStreak: number;
  onStartSprint?: () => void;
}

export function SprintScheduleCard({
  completedToday,
  dailyTarget,
  sprintStreak,
  onStartSprint,
}: SprintScheduleCardProps) {
  const remaining = Math.max(0, dailyTarget - completedToday.length);
  const avgQuality = completedToday.length > 0
    ? completedToday.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / completedToday.length
    : 0;

  return (
    <Card style={styles.container} onPress={remaining > 0 ? onStartSprint : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Sprints Today</Text>
        {sprintStreak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color={Colors.warning} />
            <Text style={styles.streakText}>{sprintStreak}d</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{completedToday.length}</Text>
          <Text style={styles.statLabel}>completed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{remaining}</Text>
          <Text style={styles.statLabel}>remaining</Text>
        </View>
        {avgQuality > 0 && (
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{avgQuality.toFixed(1)}</Text>
            <Text style={styles.statLabel}>avg quality</Text>
          </View>
        )}
      </View>

      {remaining > 0 && (
        <View style={styles.ctaRow}>
          <Ionicons name="flash" size={16} color={Colors.accent} />
          <Text style={styles.ctaText}>Tap to start your next sprint</Text>
        </View>
      )}

      {completedToday.length > 0 && (
        <View style={styles.sprintList}>
          {completedToday.map((sprint, i) => (
            <View key={sprint.id} style={styles.sprintItem}>
              <Text style={styles.sprintIndex}>#{i + 1}</Text>
              <Text style={styles.sprintIntention} numberOfLines={1}>{sprint.intention}</Text>
              <View style={styles.qualityDot}>
                <Text style={styles.qualityText}>{sprint.focus_quality ?? '-'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.warning,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  sprintList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 8,
  },
  sprintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sprintIndex: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 20,
  },
  sprintIntention: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  qualityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
});
