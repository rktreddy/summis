import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useHabits } from '@/hooks/useHabits';
import { usePerformanceScore } from '@/hooks/usePerformanceScore';
import { useSubscription } from '@/hooks/useSubscription';
import { useData } from '@/lib/data-provider';
import { computeMultipliers } from '@/lib/multiplier';
import { WeeklyReport } from '@/components/insights/WeeklyReport';
import { PerformanceChart } from '@/components/insights/PerformanceChart';
import { HabitCompletionChart } from '@/components/insights/HabitCompletionChart';
import { MultiplierStack } from '@/components/insights/MultiplierStack';
import { ExerciseCognitionCard, type ExerciseDay } from '@/components/insights/ExerciseCognitionCard';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { FocusSession } from '@/types';

export default function InsightsScreen() {
  const router = useRouter();
  const { habits, fetchHabits } = useHabits();
  const { currentScore, previousScore, delta, computeAndSave, loading } =
    usePerformanceScore();
  const { isPro } = useSubscription();
  const session = useAppStore((s) => s.session);
  const dataProvider = useData();
  const [showPaywall, setShowPaywall] = useState(false);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    if (habits.length > 0) {
      computeAndSave();
    }
  }, [habits.length]);

  useEffect(() => {
    if (session?.user?.id && isPro) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dataProvider.fetchFocusSessions(session.user.id, thirtyDaysAgo)
        .then(setFocusSessions)
        .catch(() => {});
    }
  }, [session?.user?.id, isPro]);

  const multiplierResult = useMemo(
    () => computeMultipliers(habits, focusSessions),
    [habits, focusSessions]
  );

  // Derive exercise days from exercise-category habit completions
  const exerciseDays: ExerciseDay[] = useMemo(() => {
    const days = new Map<string, number>();
    for (const h of habits) {
      if (h.category !== 'exercise') continue;
      for (const c of h.completions) {
        const date = new Date(c.completed_at).toISOString().split('T')[0];
        days.set(date, (days.get(date) ?? 0) + 30); // estimate 30 min per exercise habit
      }
    }
    return Array.from(days.entries()).map(([date, mins]) => ({ date, workoutMinutes: mins }));
  }, [habits]);

  const handleRefresh = async () => {
    await fetchHabits();
    await computeAndSave();
    if (session?.user?.id) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dataProvider.fetchFocusSessions(session.user.id, thirtyDaysAgo)
        .then(setFocusSessions)
        .catch(() => {});
    }
  };

  if (!isPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
        </View>

        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>{'\uD83D\uDD12'}</Text>
          <Text style={styles.lockedTitle}>Pro Feature</Text>
          <Text style={styles.lockedSubtext}>
            Unlock performance analytics, weekly reports, and habit charts with
            1000x Pro.
          </Text>

          {/* Show a preview of the completion chart */}
          <View style={styles.previewContainer}>
            <HabitCompletionChart habits={habits.slice(0, 3)} />
            <View style={styles.previewOverlay} />
          </View>

          <Button
            title="Upgrade to Pro"
            onPress={() => setShowPaywall(true)}
            style={styles.upgradeBtn}
            accessibilityLabel="Upgrade to Pro"
          />
        </View>

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPurchased={() => { fetchHabits(); }}
        />
      </SafeAreaView>
    );
  }

  const chartData = currentScore
    ? [
        { label: 'Habits', value: currentScore.habit_score ?? 0, color: Colors.success },
        { label: 'Focus', value: currentScore.focus_score ?? 0, color: Colors.accent },
        { label: 'Consistency', value: currentScore.consistency_score ?? 0, color: Colors.warning },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Performance analytics</Text>
        </View>

        {currentScore && (
          <WeeklyReport
            current={currentScore}
            previous={previousScore}
            delta={delta}
          />
        )}

        <View style={styles.section}>
          <MultiplierStack result={multiplierResult} />
        </View>

        <View style={styles.section}>
          {chartData.length > 0 && (
            <PerformanceChart
              data={chartData}
              title="Score Breakdown"
            />
          )}
        </View>

        <View style={styles.section}>
          <HabitCompletionChart habits={habits} />
        </View>

        {exerciseDays.length > 0 && focusSessions.length > 0 && (
          <View style={styles.section}>
            <ExerciseCognitionCard
              exerciseDays={exerciseDays}
              focusSessions={focusSessions}
            />
          </View>
        )}

        <View style={styles.section}>
          <Card>
            <Text style={styles.tipTitle}>Science Tip</Text>
            <Text style={styles.tipText}>
              Research shows that tracking habits increases success rate by 42%.
              Your consistency score reflects how regularly you show up — aim for
              at least 5 out of 7 days each week.
            </Text>
          </Card>
        </View>

        <View style={styles.navCards}>
          <Card
            style={styles.navCard}
            onPress={() => router.push('/ai-insights')}
          >
            <Text style={styles.navIcon}>{'\uD83E\uDDE0'}</Text>
            <Text style={styles.navTitle}>AI Insights</Text>
            <Text style={styles.navDesc}>Personalized analysis</Text>
          </Card>
          <Card
            style={styles.navCard}
            onPress={() => router.push('/protocols')}
          >
            <Text style={styles.navIcon}>{'\uD83E\uDDEC'}</Text>
            <Text style={styles.navTitle}>Protocols</Text>
            <Text style={styles.navDesc}>Science routines</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  lockedSubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  previewContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background + 'AA',
    borderRadius: 14,
  },
  upgradeBtn: {
    width: '100%',
  },
  tipTitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  navCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
  },
  navCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  navIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  navTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  navDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
