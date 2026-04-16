import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface MITEntryProps {
  onAdd: (title: string, estimatedMinutes: number) => void;
  slotsRemaining: number;
}

const TIME_PRESETS = [15, 30, 45, 60, 90];

export function MITEntry({ onAdd, slotsRemaining }: MITEntryProps) {
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);

  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title.trim(), estimatedMinutes);
    setTitle('');
    setEstimatedMinutes(30);
    setIsExpanded(false);
  }

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setIsExpanded(true)}
        accessibilityLabel={`Add MIT (${slotsRemaining} remaining)`}
      >
        <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
        <Text style={styles.addText}>Add MIT ({slotsRemaining} remaining)</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="What's most important today?"
        placeholderTextColor={Colors.textSecondary}
        autoFocus
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        maxLength={200}
        accessibilityLabel="MIT title"
      />

      <View style={styles.timeRow} accessibilityRole="radiogroup" accessibilityLabel="Estimated time presets">
        <Text style={styles.timeLabel}>Estimated time:</Text>
        {TIME_PRESETS.map((mins) => (
          <TouchableOpacity
            key={mins}
            style={[styles.timeBtn, estimatedMinutes === mins && styles.timeBtnActive]}
            onPress={() => setEstimatedMinutes(mins)}
            accessibilityRole="radio"
            accessibilityState={{ selected: estimatedMinutes === mins }}
            accessibilityLabel={`${mins} minutes`}
          >
            <Text style={[styles.timeText, estimatedMinutes === mins && styles.timeTextActive]}>
              {mins}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Add" onPress={handleAdd} disabled={!title.trim()} />
        <Button title="Cancel" onPress={() => setIsExpanded(false)} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '500',
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    gap: 14,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timeTextActive: {
    color: Colors.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
