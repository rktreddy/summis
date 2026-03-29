import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { FOCUS_QUALITY_LABELS, INTENTION_MET_LABELS } from '@/lib/sprint-protocol';

interface SprintReflectionProps {
  intention: string;
  onComplete: (reflection: {
    focusQuality: number;
    intentionMet: 'yes' | 'partially' | 'no';
    note: string;
  }) => void;
}

export function SprintReflection({ intention, onComplete }: SprintReflectionProps) {
  const [focusQuality, setFocusQuality] = useState<number | null>(null);
  const [intentionMet, setIntentionMet] = useState<'yes' | 'partially' | 'no' | null>(null);
  const [note, setNote] = useState('');

  const canComplete = focusQuality !== null && intentionMet !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>REFLECT</Text>
      <Text style={styles.title}>How was your focus?</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Quality</Text>
        <View style={styles.qualityRow} accessibilityRole="radiogroup" accessibilityLabel="Focus quality rating">
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.qualityBtn,
                focusQuality === rating && styles.qualityBtnActive,
              ]}
              onPress={() => setFocusQuality(rating)}
              accessibilityRole="radio"
              accessibilityState={{ selected: focusQuality === rating }}
              accessibilityLabel={`Focus quality ${rating}: ${FOCUS_QUALITY_LABELS[rating]}`}
            >
              <Text
                style={[
                  styles.qualityNumber,
                  focusQuality === rating && styles.qualityNumberActive,
                ]}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {focusQuality && (
          <Text style={styles.qualityLabel}>
            {FOCUS_QUALITY_LABELS[focusQuality]}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Did you accomplish your intention?</Text>
        <Text style={styles.intentionReminder} numberOfLines={2}>
          "{intention}"
        </Text>
        <View style={styles.intentionRow} accessibilityRole="radiogroup" accessibilityLabel="Did you accomplish your intention">
          {(Object.entries(INTENTION_MET_LABELS) as [keyof typeof INTENTION_MET_LABELS, string][]).map(
            ([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.intentionBtn,
                  intentionMet === key && styles.intentionBtnActive,
                ]}
                onPress={() => setIntentionMet(key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: intentionMet === key }}
                accessibilityLabel={`Intention: ${label}`}
              >
                <Text
                  style={[
                    styles.intentionText,
                    intentionMet === key && styles.intentionTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="One sentence about this sprint..."
          placeholderTextColor={Colors.textSecondary}
          maxLength={200}
          accessibilityLabel="Sprint reflection note"
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Done"
          onPress={() =>
            canComplete &&
            onComplete({
              focusQuality: focusQuality!,
              intentionMet: intentionMet!,
              note: note.trim(),
            })
          }
          disabled={!canComplete}
          accessibilityLabel="Complete sprint reflection"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  qualityBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '30',
  },
  qualityNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  qualityNumberActive: {
    color: Colors.accent,
  },
  qualityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  intentionReminder: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  intentionRow: {
    gap: 8,
  },
  intentionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intentionBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  intentionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  intentionTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    marginTop: 8,
  },
});
