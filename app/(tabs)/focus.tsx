import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

type SessionType = 'deep_work' | 'study' | 'creative' | 'admin';

const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '90 min', minutes: 90 },
];

const SESSION_TYPES: { key: SessionType; label: string }[] = [
  { key: 'deep_work', label: 'Deep Work' },
  { key: 'study', label: 'Study' },
  { key: 'creative', label: 'Creative' },
  { key: 'admin', label: 'Admin' },
];

export default function FocusScreen() {
  const session = useAppStore((s) => s.session);
  const data = useData();
  const [duration, setDuration] = useState(25);
  const [sessionType, setSessionType] = useState<SessionType>('deep_work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleCompleteRef = useRef<() => void>(() => {});

  const resetTimer = useCallback((minutes: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
    setStartedAt(null);
  }, []);

  // Keep ref in sync with latest state
  handleCompleteRef.current = async () => {
    if (isBreak) {
      setIsBreak(false);
      resetTimer(duration);
      return;
    }

    if (session?.user?.id && startedAt) {
      try {
        await data.saveFocusSession(session.user.id, {
          duration_minutes: duration,
          session_type: sessionType,
          completed: true,
          started_at: startedAt.toISOString(),
          ended_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving focus session:', err);
        Alert.alert('Error', 'Failed to save focus session.');
      }
    }

    const completed = sessionsCompleted + 1;
    setSessionsCompleted(completed);

    const breakMinutes = completed % 4 === 0 ? 15 : 5;
    setIsBreak(true);
    setSecondsLeft(breakMinutes * 60);
    setIsRunning(false);
    setStartedAt(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0 && isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      handleCompleteRef.current();
    }
  }, [secondsLeft, isRunning]);

  function startTimer() {
    setIsRunning(true);
    setStartedAt(new Date());
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / (duration * 60);

  // Interpolate border color opacity properly
  const timerBorderColor = `rgba(124, 92, 252, ${progress.toFixed(2)})`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus</Text>
        <Text style={styles.subtitle}>
          {isBreak ? 'Break time' : 'Deep work session'}
          {sessionsCompleted > 0 ? ` \u2022 ${sessionsCompleted} completed` : ''}
        </Text>
      </View>

      <View style={styles.timerContainer}>
        <View
          style={[styles.timerRing, { borderColor: timerBorderColor }]}
          accessibilityLabel={`${minutes} minutes ${seconds} seconds remaining`}
          accessibilityRole="timer"
        >
          <Text style={styles.timerText}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timerLabel}>{SESSION_TYPES.find((s) => s.key === sessionType)?.label}</Text>
        </View>
      </View>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.minutes}
            style={[styles.presetBtn, duration === p.minutes && styles.presetActive]}
            onPress={() => {
              if (!isRunning) {
                setDuration(p.minutes);
                setSecondsLeft(p.minutes * 60);
              }
            }}
            disabled={isRunning}
            accessibilityLabel={`Set timer to ${p.label}`}
          >
            <Text style={[styles.presetText, duration === p.minutes && styles.presetTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.typeSelector}>
        {SESSION_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeBtn, sessionType === t.key && styles.typeActive]}
            onPress={() => !isRunning && setSessionType(t.key)}
            disabled={isRunning}
            accessibilityLabel={`Session type: ${t.label}`}
          >
            <Text style={[styles.typeText, sessionType === t.key && styles.typeTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controls}>
        {!isRunning ? (
          <Button
            title={secondsLeft < duration * 60 ? 'Resume' : 'Start'}
            onPress={startTimer}
            style={styles.controlBtn}
          />
        ) : (
          <Button title="Pause" onPress={pauseTimer} variant="secondary" style={styles.controlBtn} />
        )}
        <Button
          title="Reset"
          onPress={() => resetTimer(duration)}
          variant="outline"
          style={styles.controlBtn}
          disabled={secondsLeft === duration * 60 && !isRunning}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '200',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  presetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  presetTextActive: {
    color: Colors.accent,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  typeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  typeTextActive: {
    color: Colors.accent,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  controlBtn: {
    flex: 1,
  },
});
