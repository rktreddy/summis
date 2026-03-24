import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import type { DailyPriority } from '@/types';

interface DayReviewProps {
  priorities: DailyPriority[];
  onSave: (rating: number, notes: string) => void;
}

export function DayReview({ priorities, onSave }: DayReviewProps) {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const completed = priorities.filter((p) => p.completed).length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Day Review</Text>

      <Text style={styles.summary}>
        Completed {completed}/{priorities.length} priorities
      </Text>

      {priorities.map((p, i) => (
        <View key={p.id} style={styles.priorityRow}>
          <Text style={styles.priorityIcon}>{p.completed ? '\u2705' : '\u274C'}</Text>
          <Text style={[styles.priorityTitle, p.completed && styles.priorityDone]}>
            {p.title || `Priority ${i + 1}`}
          </Text>
        </View>
      ))}

      <Text style={styles.label}>Rate your day</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.ratingBtn, rating === v && styles.ratingActive]}
            onPress={() => setRating(v)}
            accessibilityLabel={`Day rating ${v}`}
          >
            <Text style={[styles.ratingText, rating === v && styles.ratingTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Reflection (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="What went well? What would you change?"
        placeholderTextColor={Colors.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        accessibilityLabel="Day review notes"
      />

      <Button title="Save Review" onPress={() => onSave(rating, notes)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  summary: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  priorityTitle: {
    color: Colors.text,
    fontSize: 14,
  },
  priorityDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingTextActive: {
    color: Colors.accent,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    marginBottom: 16,
  },
});
