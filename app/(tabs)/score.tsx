import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useSprints } from '@/hooks/useSprints';
import { TrendLabel } from '@/components/score/TrendLabel';
import { CognitivePerformanceChart } from '@/components/score/CognitivePerformanceChart';
import { HygieneCorrelationCard } from '@/components/score/HygieneCorrelationCard';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { canAccess } from '@/lib/features';
import type { CognitiveScore } from '@/types/summis';

export default function ScoreScreen() {
  const profile = useAppStore((s) => s.profile);
  const sprints = useAppStore((s) => s.sprints);
  const tier = profile?.subscription_tier ?? 'free';
  const { completedToday, sprintStreak } = useSprints();

  // Compute simple weekly score from completed sprints
  const completedSprints = sprints.filter((s) => s.completed);
  const last7Days = completedSprints.filter((s) => {
    const sprintDate = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sprintDate >= weekAgo;
  });

  // Focus quality: avg self-reported 1-5 → 0-100 scale
  const avgQuality = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / last7Days.length * 20)
    : 0;
  // Sprint completion: completed / (target * 7 days) as percentage
  const dailyTarget = profile?.daily_sprint_target ?? 3;
  const sprintCompletion = Math.min(Math.round((last7Days.length / (dailyTarget * 7)) * 100), 100);
  // Hygiene compliance: TODO compute from hygiene logs
  const hygieneCompliance = 0;
  // MIT completion: TODO compute from MITs data
  const mitCompletion = 0;

  // Weighted score per CLAUDE.md formula: sprint 30%, quality 30%, hygiene 25%, MIT 15%
  const currentScore = Math.min(100, Math.round(
    sprintCompletion * 0.3 + avgQuality * 0.3 + hygieneCompliance * 0.25 + mitCompletion * 0.15
  ));

  // Mock previous week delta for display
  const delta = 0; // TODO: compute from historical data
  const trend: 'rising' | 'plateau' | 'declining' =
    delta > 5 ? 'rising' : delta < -5 ? 'declining' : 'plateau';

  // Build simple score array for chart
  const scores: CognitiveScore[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySprints = completedSprints.filter((s) => s.date === dateStr);
    const dayQuality = daySprints.length > 0
      ? Math.round(daySprints.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / daySprints.length * 20)
      : 0;
    scores.push({
      date: dateStr,
      overallScore: dayQuality,
      sprintScore: Math.min(daySprints.length * 33, 100),
      hygieneScore: 0, // TODO: compute from hygiene logs
      consistencyScore: daySprints.length > 0 ? 100 : 0,
      focusQuality: dayQuality,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Score</Text>
          <Text style={styles.subtitle}>Your cognitive performance</Text>
        </View>

        {/* Score Header */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.scoreNumber}>{currentScore}</Text>
              <Text style={styles.scoreLabel}>7-day average</Text>
            </View>
            <View style={styles.scoreRight}>
              <Text style={[styles.delta, delta >= 0 ? styles.deltaPositive : styles.deltaNegative]}>
                {delta >= 0 ? '+' : ''}{delta}
              </Text>
              <TrendLabel trend={trend} />
            </View>
          </View>
        </Card>

        {/* Performance Chart */}
        <CognitivePerformanceChart scores={scores} />

        {/* Weekly Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{last7Days.length}</Text>
              <Text style={styles.summaryLabel}>sprints</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {last7Days.length > 0
                  ? Math.round(last7Days.reduce((s, sp) => s + sp.duration_minutes, 0) / 60)
                  : 0}h
              </Text>
              <Text style={styles.summaryLabel}>focus time</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {last7Days.length > 0
                  ? (last7Days.reduce((s, sp) => s + (sp.focus_quality ?? 0), 0) / last7Days.length).toFixed(1)
                  : '-'}
              </Text>
              <Text style={styles.summaryLabel}>avg quality</Text>
            </View>
          </View>
        </Card>

        {/* Correlation Insights (Pro-gated) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hygiene Insights</Text>
          {!canAccess('correlation_insights', tier) ? (
            <Card style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>Unlock Hygiene Correlations</Text>
              <Text style={styles.lockedText}>
                After 30 days of data, Summis will show you which cognitive hygiene practices have the strongest impact on your focus quality. Upgrade to Pro to see your personalized insights.
              </Text>
            </Card>
          ) : completedSprints.length < 30 ? (
            <Card style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>Building Your Data</Text>
              <Text style={styles.lockedText}>
                {30 - completedSprints.length} more days of sprints needed to compute your hygiene correlations. Keep going!
              </Text>
            </Card>
          ) : (
            <Text style={styles.comingSoon}>Correlation insights will appear here</Text>
          )}
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
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
  scoreCard: {
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scoreRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  delta: {
    fontSize: 20,
    fontWeight: '700',
  },
  deltaPositive: {
    color: Colors.success,
  },
  deltaNegative: {
    color: Colors.danger,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 8,
  },
  lockedCard: {
    borderStyle: 'dashed',
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  comingSoon: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
