import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { CognitiveScore } from '@/types/summis';

interface CognitivePerformanceChartProps {
  scores: CognitiveScore[];
  title?: string;
}

/** Compute a rolling average over the given window size. */
function rollingAvg(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const nonZero = slice.filter((v) => v > 0);
    if (nonZero.length === 0) return 0;
    return Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length);
  });
}

export function CognitivePerformanceChart({ scores, title = '30-Day Trend' }: CognitivePerformanceChartProps) {
  const maxScore = 100;
  const chartHeight = 140;

  if (scores.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>Complete sprints to see your performance trend</Text>
      </Card>
    );
  }

  const dailyValues = scores.map((s) => s.overallScore);
  const avg7 = rollingAvg(dailyValues, 7);
  const avg30 = rollingAvg(dailyValues, 30);

  // Chart dimensions
  const dotSpacing = scores.length > 1 ? 100 / (scores.length - 1) : 50;

  function yPos(value: number): number {
    return chartHeight - (value / maxScore) * chartHeight;
  }

  // Month labels for x-axis (show first of each week)
  const monthLabels: { index: number; label: string }[] = [];
  scores.forEach((s, i) => {
    if (i === 0 || i === Math.floor(scores.length / 2) || i === scores.length - 1) {
      const d = new Date(s.date);
      monthLabels.push({
        index: i,
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      });
    }
  });

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.legendText}>7-day avg</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.textSecondary }]} />
          <Text style={styles.legendText}>30-day avg</Text>
        </View>
      </View>

      {/* Chart area */}
      <View style={[styles.chart, { height: chartHeight }]}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <View
            key={v}
            style={[styles.gridLine, { bottom: (v / maxScore) * chartHeight }]}
          />
        ))}

        {/* Daily score dots */}
        {scores.map((score, i) => {
          if (score.overallScore === 0) return null;
          const color = score.overallScore >= 70
            ? Colors.success
            : score.overallScore >= 40
              ? Colors.warning
              : Colors.danger;
          return (
            <View
              key={score.date}
              style={[
                styles.dot,
                {
                  left: `${i * dotSpacing}%`,
                  bottom: (score.overallScore / maxScore) * chartHeight - 3,
                  backgroundColor: color,
                  opacity: 0.4,
                },
              ]}
              accessibilityLabel={`${score.date}: score ${score.overallScore}`}
            />
          );
        })}

        {/* 30-day rolling avg line (rendered as dots, behind 7-day) */}
        {avg30.map((val, i) => {
          if (val === 0) return null;
          return (
            <View
              key={`30-${i}`}
              style={[
                styles.lineDot,
                {
                  left: `${i * dotSpacing}%`,
                  bottom: (val / maxScore) * chartHeight - 2,
                  backgroundColor: Colors.textSecondary,
                },
              ]}
            />
          );
        })}

        {/* 7-day rolling avg line (rendered as dots, on top) */}
        {avg7.map((val, i) => {
          if (val === 0) return null;
          return (
            <View
              key={`7-${i}`}
              style={[
                styles.lineDot,
                {
                  left: `${i * dotSpacing}%`,
                  bottom: (val / maxScore) * chartHeight - 2,
                  backgroundColor: Colors.accent,
                },
              ]}
            />
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {monthLabels.map(({ index, label }) => (
          <Text
            key={index}
            style={[
              styles.xLabel,
              { left: `${index * dotSpacing}%` },
            ]}
          >
            {label}
          </Text>
        ))}
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
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chart: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
  },
  lineDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: -2.5,
  },
  xAxis: {
    position: 'relative',
    height: 20,
    marginTop: 6,
  },
  xLabel: {
    position: 'absolute',
    fontSize: 11,
    color: Colors.textSecondary,
    transform: [{ translateX: -15 }],
  },
});
