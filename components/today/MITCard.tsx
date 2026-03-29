import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { MIT } from '@/types/summis';

interface MITCardProps {
  mit: MIT;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MITCard({ mit, onToggle, onDelete }: MITCardProps) {
  return (
    <View style={[styles.container, mit.completed && styles.completed]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(mit.id)}
        accessibilityLabel={`${mit.completed ? 'Uncheck' : 'Complete'} ${mit.title}`}
        accessibilityRole="checkbox"
      >
        <Ionicons
          name={mit.completed ? 'checkbox' : 'square-outline'}
          size={22}
          color={mit.completed ? Colors.success : Colors.textSecondary}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, mit.completed && styles.titleDone]} numberOfLines={2}>
          {mit.title}
        </Text>
        <Text style={styles.estimate}>
          {mit.estimated_minutes} min estimated
          {mit.actual_minutes ? ` · ${mit.actual_minutes} min actual` : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(mit.id)}
        accessibilityLabel={`Delete ${mit.title}`}
      >
        <Ionicons name="close-circle-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  completed: {
    opacity: 0.7,
  },
  checkbox: {
    padding: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  estimate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    padding: 4,
  },
});
