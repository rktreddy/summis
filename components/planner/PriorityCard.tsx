import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SESSION_TYPE_OPTIONS, DURATION_PRESETS } from '@/lib/daily-planner';
import type { DailyPriority, FocusSession } from '@/types';

interface PriorityCardProps {
  priority: DailyPriority;
  index: number;
  onChange: (updated: DailyPriority) => void;
  onToggle: () => void;
  editable?: boolean;
}

export function PriorityCard({ priority, index, onChange, onToggle, editable = true }: PriorityCardProps) {
  return (
    <View style={[styles.container, priority.completed && styles.completed]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.checkbox, priority.completed && styles.checkboxDone]}
          onPress={onToggle}
          accessibilityLabel={`Toggle priority ${index + 1}`}
        >
          {priority.completed && <Text style={styles.checkmark}>{'\u2713'}</Text>}
        </TouchableOpacity>
        <Text style={styles.number}>Priority {index + 1}</Text>
        {priority.suggested_time && (
          <Text style={styles.suggestedTime}>{priority.suggested_time}</Text>
        )}
      </View>

      {editable ? (
        <TextInput
          style={[styles.input, priority.completed && styles.inputCompleted]}
          placeholder={`What's priority #${index + 1}?`}
          placeholderTextColor={Colors.textSecondary}
          value={priority.title}
          onChangeText={(title) => onChange({ ...priority, title })}
          accessibilityLabel={`Priority ${index + 1} title`}
        />
      ) : (
        <Text style={[styles.titleText, priority.completed && styles.titleCompleted]}>
          {priority.title || '(empty)'}
        </Text>
      )}

      {editable && (
        <View style={styles.options}>
          <View style={styles.typeRow}>
            {SESSION_TYPE_OPTIONS.slice(0, 4).map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeChip, priority.session_type === t.key && styles.typeActive]}
                onPress={() => onChange({ ...priority, session_type: t.key })}
              >
                <Text style={[styles.typeText, priority.session_type === t.key && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.durationRow}>
            {DURATION_PRESETS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, priority.estimated_minutes === d && styles.durationActive]}
                onPress={() => onChange({ ...priority, estimated_minutes: d })}
              >
                <Text style={[styles.durationText, priority.estimated_minutes === d && styles.durationTextActive]}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  number: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  suggestedTime: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 10,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  inputCompleted: {
    textDecorationLine: 'line-through',
  },
  titleText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  options: {
    gap: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  typeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  typeTextActive: {
    color: Colors.accent,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
  },
  durationChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  durationTextActive: {
    color: Colors.accent,
  },
});
