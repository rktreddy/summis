import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import type { UserGoal, Chronotype } from '@/types';

interface GoalOption {
  key: UserGoal;
  emoji: string;
  title: string;
  description: string;
  habits: string[];
}

const GOALS: GoalOption[] = [
  {
    key: 'focus',
    emoji: '\uD83C\uDFAF',
    title: 'Sharpen My Focus',
    description: 'Deep work, fewer distractions, better concentration',
    habits: ['Deep Work Block (90 min)', 'No Phone Before 10am', 'Daily Planning (10 min)'],
  },
  {
    key: 'sleep',
    emoji: '\uD83C\uDF19',
    title: 'Optimize My Sleep',
    description: 'Better sleep quality, consistent schedule, more energy',
    habits: ['10:30pm Wind-Down', 'No Screens 1hr Before Bed', 'Consistent Wake Time'],
  },
  {
    key: 'fitness',
    emoji: '\uD83C\uDFC3',
    title: 'Build Fitness Habits',
    description: 'Regular movement, cardio, active recovery',
    habits: ['Morning Movement (20 min)', 'Zone 2 Cardio (30 min)', 'Evening Walk'],
  },
  {
    key: 'general',
    emoji: '\u2728',
    title: 'General Well-being',
    description: 'Journaling, hydration, gratitude, balanced routine',
    habits: ['Morning Journal', 'Hydration (8 glasses)', 'Gratitude Practice'],
  },
];

const CHRONOTYPES: { key: Chronotype; emoji: string; label: string; desc: string }[] = [
  { key: 'early', emoji: '\uD83C\uDF05', label: 'Early Bird', desc: 'I\'m most alert in the morning' },
  { key: 'moderate', emoji: '\u2600\uFE0F', label: 'Balanced', desc: 'Somewhere in between' },
  { key: 'late', emoji: '\uD83C\uDF19', label: 'Night Owl', desc: 'I peak later in the day' },
];

export interface OnboardingResult {
  goal: UserGoal;
  wakeTime: string;
  chronotype: Chronotype;
}

interface GoalQuizProps {
  onComplete: (result: OnboardingResult) => Promise<void>;
}

export function GoalQuiz({ onComplete }: GoalQuizProps) {
  const [step, setStep] = useState<'goal' | 'schedule'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [chronotype, setChronotype] = useState<Chronotype>('moderate');
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!selectedGoal) return;
    setLoading(true);
    try {
      await onComplete({ goal: selectedGoal, wakeTime, chronotype });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Summis</Text>
          {step === 'goal' ? (
            <>
              <Text style={styles.title}>What's your #1 performance goal?</Text>
              <Text style={styles.subtitle}>
                We'll set up 3 science-backed habits to get you started.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>When do you wake up?</Text>
              <Text style={styles.subtitle}>
                We'll calculate your peak focus windows and caffeine cutoff time.
              </Text>
            </>
          )}
        </View>

        {step === 'goal' ? (
          <View style={styles.options}>
            {GOALS.map((goal) => {
              const isSelected = selectedGoal === goal.key;
              return (
                <TouchableOpacity
                  key={goal.key}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedGoal(goal.key)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Goal: ${goal.title}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.emoji}>{goal.emoji}</Text>
                    <View style={styles.cardTitleWrap}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                        {goal.title}
                      </Text>
                      <Text style={styles.cardDescription}>{goal.description}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.habitPreview}>
                      <Text style={styles.habitPreviewLabel}>Your starter habits:</Text>
                      {goal.habits.map((h) => (
                        <View key={h} style={styles.habitRow}>
                          <Text style={styles.habitCheck}>{'\u2713'}</Text>
                          <Text style={styles.habitName}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.options}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Typical wake time</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Wake time"
              />
              <Text style={styles.fieldHint}>Format: HH:MM (24-hour)</Text>
            </View>

            <Text style={styles.fieldLabel}>I am a...</Text>
            {CHRONOTYPES.map((ct) => {
              const isSelected = chronotype === ct.key;
              return (
                <TouchableOpacity
                  key={ct.key}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setChronotype(ct.key)}
                  accessibilityLabel={`Chronotype: ${ct.label}`}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.emoji}>{ct.emoji}</Text>
                    <View style={styles.cardTitleWrap}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                        {ct.label}
                      </Text>
                      <Text style={styles.cardDescription}>{ct.desc}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.accent} size="small" />
            <Text style={styles.loadingText}>Setting up your habits...</Text>
          </View>
        ) : step === 'goal' ? (
          <Button
            title="Next"
            onPress={() => { if (selectedGoal) setStep('schedule'); }}
            disabled={!selectedGoal}
            style={styles.button}
          />
        ) : (
          <View style={styles.footerButtons}>
            <Button
              title="Back"
              onPress={() => setStep('goal')}
              variant="secondary"
              style={styles.halfButton}
            />
            <Button
              title="Get Started"
              onPress={handleFinish}
              style={styles.halfButton}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24, paddingBottom: 120 },
  header: { alignItems: 'center', marginTop: 48, marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: '900', color: Colors.accent, letterSpacing: -2, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  options: { gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: Colors.border },
  cardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '10' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 28, marginRight: 14 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  cardTitleSelected: { color: Colors.accent },
  cardDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.accent },
  habitPreview: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  habitPreviewLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  habitCheck: { color: Colors.success, fontSize: 14, fontWeight: '700', marginRight: 8 },
  habitName: { color: Colors.text, fontSize: 14 },
  field: { marginBottom: 20 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeInput: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 16, color: Colors.text, fontSize: 24, fontWeight: '700', borderWidth: 1, borderColor: Colors.border, textAlign: 'center', fontVariant: ['tabular-nums'] },
  fieldHint: { color: Colors.textSecondary, fontSize: 11, marginTop: 6, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  button: { width: '100%' },
  footerButtons: { flexDirection: 'row', gap: 12 },
  halfButton: { flex: 1 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },
});
