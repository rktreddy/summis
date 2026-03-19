import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PerformanceChartProps {
  data: BarDataPoint[];
  title: string;
  maxValue?: number;
}

/**
 * Simple bar chart built with Views.
 * Victory Native can be swapped in once dependencies are installed.
 */
export function PerformanceChart({
  data,
  title,
  maxValue = 100,
}: PerformanceChartProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {data.map((point, idx) => {
          const height = Math.max(4, (point.value / maxValue) * 120);
          const color = point.color ?? Colors.accent;

          return (
            <View key={`${point.label}-${idx}`} style={styles.barContainer}>
              <Text style={styles.barValue}>{point.value}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    width: '60%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
});
