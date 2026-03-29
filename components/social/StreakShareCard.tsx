import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { getMilestoneMessage } from '@/lib/streak-milestones';
import { Colors } from '@/constants/Colors';

interface StreakShareCardProps {
  streakCount: number;
  habitName: string;
  onShare: () => void;
  onDismiss: () => void;
}

export function StreakShareCard({
  streakCount,
  habitName,
  onShare,
  onDismiss,
}: StreakShareCardProps) {
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.logo}>Summis</Text>
          <Text style={styles.fireEmoji}>{'\uD83D\uDD25'}</Text>
          <Text style={styles.streak}>{streakCount}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
          <Text style={styles.habitName}>{habitName}</Text>
          <Text style={styles.message}>{getMilestoneMessage(streakCount)}</Text>

          <View style={styles.buttons}>
            <Button title="Share" onPress={onShare} style={styles.btn} />
            <Button
              title="Dismiss"
              onPress={onDismiss}
              variant="secondary"
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 32,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -1,
    marginBottom: 20,
  },
  fireEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  streak: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.warning,
    lineHeight: 72,
  },
  streakLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
  },
});
