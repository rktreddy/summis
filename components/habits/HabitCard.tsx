import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, CATEGORY_COLORS } from '@/constants/Colors';
import type { HabitWithCompletions } from '@/types';
import { useMemo } from 'react';

interface HabitCardProps {
  habit: HabitWithCompletions;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return habit.completions.some((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= today.getTime() && t < tomorrow.getTime();
    });
  }, [habit.completions]);

  const handleLongPress = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.content}
        onLongPress={handleLongPress}
        accessibilityLabel={`${habit.title}, ${completedToday ? 'completed' : 'not completed'}`}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{habit.title}</Text>
          <View style={styles.meta}>
            {habit.category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: (CATEGORY_COLORS[habit.category] ?? Colors.accent) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: CATEGORY_COLORS[habit.category] ?? Colors.accent },
                  ]}
                >
                  {habit.category}
                </Text>
              </View>
            )}
            {habit.currentStreak > 0 && (
              <Text style={styles.streak}>
                {'\uD83D\uDD25'} {habit.currentStreak}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkbox,
            completedToday && styles.checkboxCompleted,
          ]}
          onPress={onToggle}
          accessibilityLabel={`Toggle ${habit.title}`}
          accessibilityRole="checkbox"
        >
          {completedToday && <Text style={styles.checkmark}>{'\u2713'}</Text>}
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  streak: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
