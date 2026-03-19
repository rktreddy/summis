import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { HabitWithCompletions } from '@/types';

interface HabitCompletionChartProps {
  habits: HabitWithCompletions[];
}

/**
 * 7-day completion heatmap grid.
 * Each row = one habit, each column = one day.
 */
export function HabitCompletionChart({ habits }: HabitCompletionChartProps) {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }

  const dayLabels = days.map((d) =>
    d.toLocaleDateString('en-US', { weekday: 'narrow' })
  );

  function wasCompleted(habit: HabitWithCompletions, day: Date): boolean {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    return habit.completions.some((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= day.getTime() && t < nextDay.getTime();
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 7 Days</Text>

      {/* Day headers */}
      <View style={styles.headerRow}>
        <View style={styles.labelCell} />
        {dayLabels.map((label, idx) => (
          <View key={idx} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Habit rows */}
      {habits.map((habit) => (
        <View key={habit.id} style={styles.habitRow}>
          <View style={styles.labelCell}>
            <Text style={styles.habitLabel} numberOfLines={1}>
              {habit.title}
            </Text>
          </View>
          {days.map((day, idx) => {
            const completed = wasCompleted(habit, day);
            return (
              <View key={idx} style={styles.dayCell}>
                <View
                  style={[
                    styles.dot,
                    completed ? styles.dotCompleted : styles.dotEmpty,
                  ]}
                />
              </View>
            );
          })}
        </View>
      ))}

      {habits.length === 0 && (
        <Text style={styles.empty}>No habits to display</Text>
      )}
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
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelCell: {
    width: 80,
    paddingRight: 8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  habitLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  dotEmpty: {
    backgroundColor: Colors.border,
  },
  empty: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
