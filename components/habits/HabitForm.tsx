import { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Colors, CATEGORY_COLORS } from '@/constants/Colors';
import type { Habit } from '@/types';

type Difficulty = 'easy' | 'moderate' | 'hard';

interface HabitFormData {
  title: string;
  description?: string;
  category?: Habit['category'];
  science_note?: string;
  difficulty?: Difficulty;
  trigger_cue?: string;
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
  { key: 'recovery', label: 'Recovery', color: CATEGORY_COLORS.recovery },
  { key: 'general', label: 'General', color: CATEGORY_COLORS.general },
] as const;

interface Suggestion {
  title: string;
  description: string;
  difficulty: Difficulty;
}

const SUGGESTIONS: Record<string, Suggestion[]> = {
  focus: [
    { title: 'Deep Work Block (90 min)', description: '90-minute focused session on your most important task', difficulty: 'hard' },
    { title: 'No Phone Before 10am', description: 'Avoid phone for the first hours after waking', difficulty: 'easy' },
    { title: 'Daily Planning (10 min)', description: 'Plan your top 3 priorities for the day', difficulty: 'moderate' },
    { title: 'Single-Tasking Hour', description: 'Work on one thing only — no tab switching', difficulty: 'moderate' },
  ],
  sleep: [
    { title: 'Consistent Wake Time', description: 'Wake up within 30 min of the same time daily', difficulty: 'easy' },
    { title: 'No Screens 1hr Before Bed', description: 'Avoid screens 60 minutes before sleep', difficulty: 'moderate' },
    { title: '10:30pm Wind-Down', description: 'Begin your wind-down routine by 10:30pm', difficulty: 'moderate' },
    { title: 'Sleep 7+ Hours', description: 'Aim for at least 7 hours of sleep each night', difficulty: 'moderate' },
  ],
  exercise: [
    { title: 'Morning Movement (20 min)', description: '20 minutes of light exercise or stretching', difficulty: 'moderate' },
    { title: 'Zone 2 Cardio (30 min)', description: 'Conversational-pace jog, bike, or swim', difficulty: 'hard' },
    { title: 'Evening Walk', description: '15-20 minute walk after dinner', difficulty: 'easy' },
    { title: '10,000 Steps', description: 'Hit 10k steps throughout the day', difficulty: 'moderate' },
  ],
  nutrition: [
    { title: 'Drink 8 Glasses of Water', description: 'Track daily water intake', difficulty: 'easy' },
    { title: 'Eat 5 Servings of Vegetables', description: 'Include vegetables in every meal', difficulty: 'moderate' },
    { title: 'No Sugar After 6pm', description: 'Avoid sugary snacks in the evening', difficulty: 'moderate' },
    { title: 'Prep Meals on Sunday', description: 'Batch cook healthy meals for the week', difficulty: 'hard' },
  ],
  mindfulness: [
    { title: 'Morning Meditation (10 min)', description: '10 minutes of mindful breathing', difficulty: 'easy' },
    { title: 'Gratitude Practice', description: 'Write down 3 things you are grateful for', difficulty: 'easy' },
    { title: 'Journal Before Bed', description: 'Write a short reflection on the day', difficulty: 'moderate' },
    { title: 'Digital Detox Hour', description: '1 hour per day completely offline', difficulty: 'hard' },
  ],
  recovery: [
    { title: 'Cold Shower (2 min)', description: 'End your shower with 2 minutes of cold water', difficulty: 'easy' },
    { title: 'Cold Plunge (3-5 min)', description: 'Full cold immersion for dopamine and focus boost', difficulty: 'hard' },
    { title: 'Contrast Shower', description: 'Alternate hot and cold water for recovery', difficulty: 'moderate' },
    { title: 'Stretching / Mobility (10 min)', description: 'Daily flexibility and joint mobility work', difficulty: 'easy' },
  ],
  general: [
    { title: 'Read 20 Pages', description: 'Daily reading habit', difficulty: 'moderate' },
    { title: 'Make Your Bed', description: 'Start the day with a small win', difficulty: 'easy' },
    { title: 'Learn Something New (15 min)', description: 'Spend 15 minutes on a course or tutorial', difficulty: 'moderate' },
    { title: 'Inbox Zero', description: 'Process all emails to zero by end of day', difficulty: 'hard' },
  ],
};

export function HabitForm({ onSubmit, onCancel }: HabitFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Habit['category']>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [triggerCue, setTriggerCue] = useState('');
  const [error, setError] = useState('');

  const suggestions = useMemo(
    () => (category ? SUGGESTIONS[category] ?? [] : []),
    [category]
  );

  function applySuggestion(s: Suggestion) {
    setTitle(s.title);
    setDescription(s.description);
    setDifficulty(s.difficulty);
    if (error) setError('');
  }

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
      difficulty,
      trigger_cue: triggerCue.trim() || undefined,
    });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>New Habit</Text>

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

      {suggestions.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>Suggestions — or type your own below</Text>
          <View style={styles.suggestions}>
            {suggestions.map((s) => {
              const color = CATEGORY_COLORS[category ?? 'general'] ?? Colors.textSecondary;
              const isSelected = title === s.title;
              return (
                <TouchableOpacity
                  key={s.title}
                  style={[
                    styles.suggestion,
                    isSelected && { borderColor: color, backgroundColor: color + '12' },
                  ]}
                  onPress={() => applySuggestion(s)}
                  accessibilityLabel={`Suggestion: ${s.title}`}
                >
                  <Text style={[styles.suggestionTitle, isSelected && { color }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.suggestionDesc} numberOfLines={1}>
                    {s.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder={category ? 'Or type a custom habit...' : 'e.g. Morning meditation'}
          placeholderTextColor={Colors.textSecondary}
          onChangeText={(text) => {
            setTitle(text);
            if (error) setError('');
          }}
          value={title}
          accessibilityLabel="Habit title"
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
        <Text style={styles.label}>If-Then Trigger (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="When [situation], I will do this habit"
          placeholderTextColor={Colors.textSecondary}
          onChangeText={setTriggerCue}
          value={triggerCue}
          accessibilityLabel="If-then trigger"
        />
        <Text style={styles.triggerHint}>Research: if-then plans triple goal completion rates</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chips}>
          {(['easy', 'moderate', 'hard'] as const).map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.chip,
                difficulty === d && {
                  backgroundColor: (d === 'easy' ? Colors.success : d === 'hard' ? Colors.warning : Colors.accent) + '30',
                  borderColor: d === 'easy' ? Colors.success : d === 'hard' ? Colors.warning : Colors.accent,
                },
              ]}
              onPress={() => setDifficulty(d)}
              accessibilityLabel={`Difficulty: ${d}`}
            >
              <Text
                style={[
                  styles.chipText,
                  difficulty === d && { color: d === 'easy' ? Colors.success : d === 'hard' ? Colors.warning : Colors.accent },
                ]}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    maxHeight: 520,
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
  triggerHint: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  suggestions: {
    gap: 6,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  suggestionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
    marginBottom: 20,
  },
});
