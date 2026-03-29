import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { getRestSuggestion, getRestDuration } from '@/lib/sprint-protocol';

interface SprintRestProps {
  sprintDuration: number;
  onReady: () => void;
}

export function SprintRest({ sprintDuration, onReady }: SprintRestProps) {
  const restMinutes = getRestDuration(sprintDuration);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [suggestion] = useState(() => getRestSuggestion());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const isMinimumRest = secondsElapsed >= restMinutes * 60;

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>REST</Text>
      <Text style={styles.title}>Take a real break</Text>

      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </View>

      <View style={styles.timerSection}>
        <Text style={styles.restTimer}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
        <Text style={styles.restTarget}>
          {isMinimumRest ? 'Minimum rest reached' : `Recommended: ${restMinutes} minutes`}
        </Text>
      </View>

      <View style={styles.reminders}>
        <Text style={styles.reminderItem}>Do not check your phone</Text>
        <Text style={styles.reminderItem}>Do not check email or messages</Text>
        <Text style={styles.reminderItem}>Do not scroll social media</Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={isMinimumRest ? 'Ready for reflection' : `Rest for ${restMinutes - minutes} more min`}
          onPress={onReady}
          disabled={!isMinimumRest}
          accessibilityLabel="Continue to reflection"
        />
      </View>
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
    color: Colors.success,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 32,
  },
  suggestionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  restTimer: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  restTarget: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reminders: {
    marginBottom: 32,
    gap: 8,
  },
  reminderItem: {
    fontSize: 14,
    color: Colors.danger + 'CC',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
  },
});
