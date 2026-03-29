import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { CognitiveScore } from '@/types/summis';

interface CognitivePerformanceChartProps {
  scores: CognitiveScore[];
  title?: string;
}

export function CognitivePerformanceChart({ scores, title = 'Performance Trend' }: CognitivePerformanceChartProps) {
  const maxScore = 100;
  const displayScores = scores.slice(-7);

  if (displayScores.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>Complete sprints to see your performance trend</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {displayScores.map((score, i) => {
          const height = Math.max((score.overallScore / maxScore) * 120, 4);
          const dayLabel = new Date(score.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
          const color = score.overallScore >= 70
            ? Colors.success
            : score.overallScore >= 40
              ? Colors.warning
              : Colors.danger;
          return (
            <View key={score.date} style={styles.barCol}>
              <Text style={styles.barValue}>{score.overallScore}</Text>
              <View style={[styles.bar, { height, backgroundColor: color }]} />
              <Text style={styles.barLabel}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: 20,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
