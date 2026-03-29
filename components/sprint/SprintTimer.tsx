import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface SprintTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  intention: string;
  isRunning: boolean;
  interruptions: number;
  onPause: () => void;
  onResume: () => void;
}

export function SprintTimer({
  secondsLeft,
  totalSeconds,
  intention,
  isRunning,
  interruptions,
  onPause,
  onResume,
}: SprintTimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const timerBorderColor = `rgba(124, 92, 252, ${Math.max(progress, 0.15).toFixed(2)})`;

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>FOCUS</Text>

      <Text style={styles.intention} numberOfLines={2}>
        {intention}
      </Text>

      <View style={styles.timerContainer}>
        <View
          style={[styles.timerRing, { borderColor: timerBorderColor }]}
          accessibilityLabel={`${minutes} minutes ${seconds} seconds remaining`}
          accessibilityRole="timer"
        >
          <Text style={styles.timerText}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timerSubtext}>
            {isRunning ? 'Deep focus' : 'Paused'}
          </Text>
        </View>
      </View>

      {interruptions > 0 && (
        <Text style={styles.interruptionCount}>
          {interruptions} interruption{interruptions !== 1 ? 's' : ''}
        </Text>
      )}

      <View style={styles.controls}>
        {isRunning ? (
          <Button
            title="Pause"
            onPress={onPause}
            variant="secondary"
            accessibilityLabel="Pause sprint"
          />
        ) : (
          <Button
            title="Resume"
            onPress={onResume}
            accessibilityLabel="Resume sprint"
          />
        )}
      </View>

      <Text style={styles.encouragement}>
        The phone is away. You are doing deep work.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  intention: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  interruptionCount: {
    fontSize: 13,
    color: Colors.warning,
    marginBottom: 24,
  },
  controls: {
    marginBottom: 32,
    minWidth: 160,
  },
  encouragement: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
