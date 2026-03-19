import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Colors, CATEGORY_COLORS } from '@/constants/Colors';

interface HabitFormData {
  title: string;
  description?: string;
  category?: 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness' | null;
  science_note?: string;
}

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { key: 'focus', label: 'Focus', color: CATEGORY_COLORS.focus },
  { key: 'sleep', label: 'Sleep', color: CATEGORY_COLORS.sleep },
  { key: 'exercise', label: 'Exercise', color: CATEGORY_COLORS.exercise },
  { key: 'nutrition', label: 'Nutrition', color: CATEGORY_COLORS.nutrition },
  { key: 'mindfulness', label: 'Mindfulness', color: CATEGORY_COLORS.mindfulness },
] as const;

export function HabitForm({ onSubmit, onCancel }: HabitFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitFormData['category']>(null);
  const [error, setError] = useState('');

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required');
      return;
    }
    setError('');
    onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      category,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New Habit</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning meditation"
          placeholderTextColor={Colors.textSecondary}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError('');
          }}
          value={title}
          accessibilityLabel="Habit title"
          autoFocus
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What does this habit involve?"
          placeholderTextColor={Colors.textSecondary}
          onChangeText={setDescription}
          value={description}
          accessibilityLabel="Habit description"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.chip,
                  category === cat.key && {
                    backgroundColor: cat.color + '30',
                    borderColor: cat.color,
                  },
                ]}
                onPress={() =>
                  setCategory(category === cat.key ? null : cat.key)
                }
                accessibilityLabel={`Category: ${cat.label}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === cat.key && { color: cat.color },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttons}>
        <Button title="Cancel" onPress={onCancel} variant="secondary" style={{ flex: 1 }} />
        <Button
          title="Create Habit"
          onPress={handleSubmit}
          variant="primary"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
