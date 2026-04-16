import { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useSprints } from '@/hooks/useSprints';
import { useCognitiveScore } from '@/hooks/useCognitiveScore';
import { useHygieneCorrelations } from '@/hooks/useHygieneCorrelations';
import { TrendLabel } from '@/components/score/TrendLabel';
import { CognitivePerformanceChart } from '@/components/score/CognitivePerformanceChart';
import { HygieneCorrelationCard } from '@/components/score/HygieneCorrelationCard';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { canAccess } from '@/lib/features';

export default function ScoreScreen() {
  const profile = useAppStore((s) => s.profile);
  const sprints = useAppStore((s) => s.sprints);
  const tier = profile?.subscription_tier ?? 'free';
  const { completedToday, sprintStreak } = useSprints();
  const { dailyScores, last7Scores, avg7Day: currentScore, delta, trend } = useCognitiveScore();
  const { correlations, hasEnoughData, totalDataDays } = useHygieneCorrelations();

  const completedSprints = useMemo(() => sprints.filter((s) => s.completed), [sprints]);

  // Last 7 days of completed sprints for weekly summary
  const last7Days = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedSprints.filter((s) => new Date(s.date) >= weekAgo);
  }, [completedSprints]);

  // Sprint quality by time of day
  const timeOfDayStats = useMemo(() => {
    const buckets: Record<string, { total: number; count: number }> = {
      morning: { total: 0, count: 0 },
      afternoon: { total: 0, count: 0 },
      evening: { total: 0, count: 0 },
    };

    for (const sprint of completedSprints) {
      if (sprint.focus_quality === null) continue;
      const hour = new Date(sprint.started_at).getHours();
      const bucket = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      buckets[bucket].total += sprint.focus_quality;
      buckets[bucket].count++;
    }

    return Object.entries(buckets).map(([period, data]) => ({
      period,
      label: period.charAt(0).toUpperCase() + period.slice(1),
      avg: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    }));
  }, [completedSprints]);

  const hasTimeData = timeOfDayStats.some((s) => s.count > 0);

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

        {/* 30-Day Performance Chart */}
        <CognitivePerformanceChart scores={dailyScores} />

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

        {/* Sprint Quality by Time of Day */}
        {hasTimeData && (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Focus by Time of Day</Text>
            <View style={styles.timeOfDayRow}>
              {timeOfDayStats.map((stat) => (
                <View key={stat.period} style={styles.timeOfDayItem}>
                  <View style={styles.timeOfDayBar}>
                    <View
                      style={[
                        styles.timeOfDayFill,
                        {
                          height: `${Math.min((stat.avg / 5) * 100, 100)}%`,
                          backgroundColor: stat.avg >= 3.5
                            ? Colors.success
                            : stat.avg >= 2.5
                              ? Colors.warning
                              : stat.count > 0
                                ? Colors.danger
                                : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeOfDayAvg}>
                    {stat.count > 0 ? stat.avg.toFixed(1) : '-'}
                  </Text>
                  <Text style={styles.timeOfDayLabel}>{stat.label}</Text>
                  <Text style={styles.timeOfDayCount}>
                    {stat.count} sprint{stat.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

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
          ) : !hasEnoughData ? (
            <Card style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>Building Your Data</Text>
              <Text style={styles.lockedText}>
                {30 - totalDataDays} more days of sprints needed to compute your hygiene correlations. Keep going!
              </Text>
            </Card>
          ) : correlations.length === 0 ? (
            <Card style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>No Strong Correlations Yet</Text>
              <Text style={styles.lockedText}>
                We have enough data but haven't found significant links between your hygiene practices and focus quality yet. Keep tracking consistently — patterns often emerge after 60+ days.
              </Text>
            </Card>
          ) : (
            <View style={styles.correlationList}>
              {correlations.map((corr) => (
                <HygieneCorrelationCard key={corr.practice} correlation={corr} />
              ))}
            </View>
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
  // Time of day breakdown
  timeOfDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  timeOfDayItem: {
    alignItems: 'center',
    gap: 4,
  },
  timeOfDayBar: {
    width: 32,
    height: 60,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  timeOfDayFill: {
    width: '100%',
    borderRadius: 6,
  },
  timeOfDayAvg: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timeOfDayLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  timeOfDayCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Correlation section
  section: {
    marginTop: 8,
  },
  correlationList: {
    gap: 12,
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
});
