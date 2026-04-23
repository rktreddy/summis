import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useSprints } from '@/hooks/useSprints';
import { useMITs } from '@/hooks/useMITs';
import { useSubscription } from '@/hooks/useSubscription';
import { canStartSprint } from '@/lib/features';
import { SprintIntention } from '@/components/sprint/SprintIntention';
import { SprintTimer } from '@/components/sprint/SprintTimer';
import { SprintRest } from '@/components/sprint/SprintRest';
import { SprintReflection } from '@/components/sprint/SprintReflection';
import { InterruptionLogger } from '@/components/focus/InterruptionLogger';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { enableDND, disableDND } from '@/lib/dnd-integration';
import type { SprintPhase } from '@/types/summis';

export default function SprintScreen() {
  const profile = useAppStore((s) => s.profile);
  const hygieneConfigs = useAppStore((s) => s.hygieneConfigs);
  const {
    activeSprint,
    todaySprints,
    completedToday,
    sprintStreak,
    startSprint,
    completeSprint,
    updatePhase,
    setActiveSprint,
  } = useSprints();

  const { todayMITs } = useMITs();

  const tier = profile?.subscription_tier ?? 'free';
  const canStart = canStartSprint(tier, todaySprints.length);
  const sprintDuration = profile?.sprint_duration_preference ?? 45;

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [interruptionTypes, setInterruptionTypes] = useState<string[]>([]);
  const [showInterruptionLogger, setShowInterruptionLogger] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase: SprintPhase | 'idle' = activeSprint?.phase ?? 'idle';

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Recover incomplete sprint on mount (e.g., app was closed mid-sprint)
  useEffect(() => {
    if (activeSprint) return; // Already have an active sprint
    const incomplete = todaySprints.find((s) => !s.completed && s.started_at);
    if (!incomplete) return;

    // Calculate remaining time if still in focus phase
    if (incomplete.phase === 'focus') {
      const elapsed = Math.floor((Date.now() - new Date(incomplete.started_at).getTime()) / 1000);
      const totalSeconds = incomplete.duration_minutes * 60;
      const remaining = totalSeconds - elapsed;
      if (remaining > 0) {
        setActiveSprint(incomplete);
        setSecondsLeft(remaining);
        startTimer();
      } else {
        // Timer would have expired — move to rest
        setActiveSprint(incomplete);
        updatePhase(incomplete.id, 'rest');
      }
    } else {
      // Rest or reflection phase — just restore the sprint
      setActiveSprint(incomplete);
    }
  }, [todaySprints.length]); // Only run when sprint list changes (e.g., after data load)

  // Timer countdown logic
  useEffect(() => {
    if (secondsLeft <= 0 && isRunning && currentPhase === 'focus') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      // Move to rest phase
      if (activeSprint) {
        updatePhase(activeSprint.id, 'rest');
      }
    }
  }, [secondsLeft, isRunning, currentPhase, activeSprint, updatePhase]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setShowInterruptionLogger(true);
  }, []);

  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  const endSprintEarly = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(0);
    if (activeSprint) {
      updatePhase(activeSprint.id, 'reflection');
    }
  }, [activeSprint, updatePhase]);

  // Handle starting a sprint from intention phase
  async function handleStartSprint(intention: string, hygieneChecks: Record<string, boolean>, mitId?: string) {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const sprint = await startSprint({
        intention,
        durationMinutes: sprintDuration,
        phoneAway: hygieneChecks['phone_away'] ?? false,
        dndEnabled: hygieneChecks['dnd_active'] ?? false,
        environmentReady: hygieneChecks['environment_clear'] ?? false,
        mitId,
      });
      setSecondsLeft(sprintDuration * 60);
      startTimer();
      // Enable DND when sprint starts (best-effort)
      if (hygieneChecks['dnd_active']) {
        enableDND().catch(console.warn);
      }
    } catch (err) {
      console.error('Failed to start sprint:', err);
    } finally {
      setIsStarting(false);
    }
  }

  // Handle rest phase completion
  function handleRestComplete() {
    if (activeSprint) {
      updatePhase(activeSprint.id, 'reflection');
    }
  }

  // Handle reflection completion
  async function handleReflectionComplete(reflection: {
    focusQuality: number;
    intentionMet: 'yes' | 'partially' | 'no';
    note: string;
  }) {
    if (!activeSprint) return;
    await completeSprint(activeSprint.id, {
      ...reflection,
      interruptions,
      interruptionTypes,
    });
    // Disable DND when sprint ends (best-effort)
    disableDND().catch(console.warn);
    // Reset timer state
    setSecondsLeft(0);
    setInterruptions(0);
    setInterruptionTypes([]);
  }

  function handleLogInterruption(type: string) {
    setInterruptions((prev) => prev + 1);
    setInterruptionTypes((prev) => [...prev, type]);
    setShowInterruptionLogger(false);
  }

  // ── Render by phase ──

  // Idle state — no active sprint
  if (currentPhase === 'idle') {
    if (!canStart) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.title}>Daily Limit Reached</Text>
            <Text style={styles.subtitle}>
              You've completed {todaySprints.length} sprints today.{'\n'}
              Upgrade to Pro for unlimited sprints.
            </Text>
            {completedToday.length > 0 && (
              <Text style={styles.streak}>
                {sprintStreak} day sprint streak
              </Text>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <SprintIntention
          onStart={handleStartSprint}
          hygieneConfigs={hygieneConfigs}
          todayMITs={todayMITs}
          chronotype={profile?.chronotype as 'am_shifted' | 'bi_phasic' | 'pm_shifted' | undefined}
          wakeTime={profile?.wake_time ?? undefined}
        />
      </SafeAreaView>
    );
  }

  // Focus phase — timer running
  if (currentPhase === 'focus' && activeSprint) {
    return (
      <SafeAreaView style={styles.container}>
        <SprintTimer
          secondsLeft={secondsLeft}
          totalSeconds={activeSprint.duration_minutes * 60}
          intention={activeSprint.intention}
          isRunning={isRunning}
          interruptions={interruptions}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onEndEarly={endSprintEarly}
        />
        <InterruptionLogger
          visible={showInterruptionLogger}
          onLog={handleLogInterruption}
          onDismiss={() => {
            setShowInterruptionLogger(false);
            resumeTimer();
          }}
        />
      </SafeAreaView>
    );
  }

  // Rest phase
  if (currentPhase === 'rest' && activeSprint) {
    return (
      <SafeAreaView style={styles.container}>
        <SprintRest
          sprintDuration={activeSprint.duration_minutes}
          onReady={handleRestComplete}
        />
      </SafeAreaView>
    );
  }

  // Reflection phase
  if (currentPhase === 'reflection' && activeSprint) {
    return (
      <SafeAreaView style={styles.container}>
        <SprintReflection
          intention={activeSprint.intention}
          onComplete={handleReflectionComplete}
        />
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  streak: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
});
