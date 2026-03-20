import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, CATEGORY_COLORS } from '@/constants/Colors';
import { isCompletedToday } from '@/lib/date-utils';
import type { HabitWithCompletions } from '@/types';
import { useMemo } from 'react';

interface HabitCardProps {
  habit: HabitWithCompletions;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const completedToday = useMemo(
    () => isCompletedToday(habit.completions),
    [habit.completions]
  );

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to remove "${habit.title}"?`)) {
        onDelete();
      }
    } else {
      Alert.alert(
        'Remove Habit',
        `Are you sure you want to remove "${habit.title}"? Your history will be preserved.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: onDelete },
        ]
      );
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.content}
        onLongPress={handleDelete}
        accessibilityLabel={`${habit.title}, ${completedToday ? 'completed' : 'not completed'}`}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{habit.title}</Text>
          {habit.trigger_cue && (
            <Text style={styles.triggerCue}>When: {habit.trigger_cue}</Text>
          )}
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

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            accessibilityLabel={`Remove ${habit.title}`}
          >
            <Text style={styles.deleteBtnText}>{'\u00D7'}</Text>
          </TouchableOpacity>
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
        </View>
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
    marginBottom: 2,
  },
  triggerCue: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 4,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger + '15',
  },
  deleteBtnText: {
    color: Colors.danger,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
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
