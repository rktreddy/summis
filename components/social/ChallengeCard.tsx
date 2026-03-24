import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { getChallengeProgress, isChallengeComplete } from '@/lib/accountability';
import type { StreakChallenge } from '@/types';

interface ChallengeCardProps {
  challenge: StreakChallenge;
  userName?: string;
  partnerName?: string;
}

export function ChallengeCard({ challenge, userName = 'You', partnerName = 'Partner' }: ChallengeCardProps) {
  const progress = getChallengeProgress(challenge);
  const complete = isChallengeComplete(challenge);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.habit_title}</Text>
        {complete && <Text style={styles.completeBadge}>{'\u2705'}</Text>}
      </View>
      <Text style={styles.target}>{challenge.target_days}-day challenge</Text>

      <View style={styles.progressSection}>
        <ProgressRow
          label={userName}
          progress={challenge.user_progress}
          target={challenge.target_days}
          percent={progress.userPercent}
          color={Colors.accent}
        />
        <ProgressRow
          label={partnerName}
          progress={challenge.partner_progress}
          target={challenge.target_days}
          percent={progress.partnerPercent}
          color={Colors.success}
        />
      </View>
    </Card>
  );
}

function ProgressRow({
  label,
  progress,
  target,
  percent,
  color,
}: {
  label: string;
  progress: number;
  target: number;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.progressRow}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressCount}>{progress}/{target}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  completeBadge: {
    fontSize: 16,
  },
  target: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  progressSection: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    width: 60,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCount: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 30,
    textAlign: 'right',
  },
});
