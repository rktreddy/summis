import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { getWorkTypeSuggestion } from '@/lib/sprint-protocol';
import { ENERGY_PHASE_INFO } from '@/lib/chronotype-engine';
import type { HygieneConfig, MIT, ChronotypeCategory } from '@/types/summis';

interface SprintIntentionProps {
  onStart: (intention: string, hygieneChecks: Record<string, boolean>, mitId?: string) => void;
  hygieneConfigs: HygieneConfig[];
  todayMITs?: MIT[];
  chronotype?: ChronotypeCategory;
  wakeTime?: string;
}

export function SprintIntention({ onStart, hygieneConfigs, todayMITs = [], chronotype, wakeTime }: SprintIntentionProps) {
  const [intention, setIntention] = useState('');
  const [selectedMitId, setSelectedMitId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const activeConfigs = hygieneConfigs.filter((c) => c.is_active);

  // Energy phase coaching
  const workSuggestion = chronotype && wakeTime
    ? getWorkTypeSuggestion(chronotype, wakeTime)
    : null;
  const phaseInfo = workSuggestion?.phase ? ENERGY_PHASE_INFO[workSuggestion.phase] : null;

  function toggleCheck(practice: string) {
    setChecks((prev) => ({ ...prev, [practice]: !prev[practice] }));
  }

  const allChecked = activeConfigs.length > 0 && activeConfigs.every((c) => checks[c.practice]);
  const canStart = intention.trim().length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.phaseLabel}>SET INTENTION</Text>
      <Text style={styles.title}>What will you accomplish?</Text>
      <Text style={styles.subtitle}>
        Write exactly what you plan to achieve in this sprint.
      </Text>

      {/* Energy phase coaching card */}
      {workSuggestion && phaseInfo && (
        <View style={[styles.energyCard, { borderLeftColor: phaseInfo.color }]}>
          <View style={styles.energyCardHeader}>
            <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color + '25' }]}>
              <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>
                {phaseInfo.label}
              </Text>
            </View>
            <Text style={styles.energyCardWorkType}>{phaseInfo.workType}</Text>
          </View>
          <Text style={styles.energyCardSuggestion}>{workSuggestion.suggestion}</Text>
          <View style={styles.workTypeChips}>
            {workSuggestion.workTypes.slice(0, 4).map((wt) => (
              <View key={wt} style={styles.chip}>
                <Text style={styles.chipText}>{wt}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* MIT picker — link a sprint to today's MIT */}
      {todayMITs.length > 0 && (
        <View style={styles.mitSection}>
          <Text style={styles.mitSectionTitle}>Link to MIT</Text>
          <View style={styles.mitChips}>
            {todayMITs.filter((m) => !m.completed).map((mit) => (
              <TouchableOpacity
                key={mit.id}
                style={[styles.mitChip, selectedMitId === mit.id && styles.mitChipSelected]}
                onPress={() => {
                  if (selectedMitId === mit.id) {
                    setSelectedMitId(null);
                    setIntention('');
                  } else {
                    setSelectedMitId(mit.id);
                    setIntention(mit.title);
                  }
                }}
                accessibilityLabel={`Link to MIT: ${mit.title}`}
                accessibilityRole="radio"
              >
                <Ionicons
                  name={selectedMitId === mit.id ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={selectedMitId === mit.id ? Colors.accent : Colors.textSecondary}
                />
                <Text
                  style={[styles.mitChipText, selectedMitId === mit.id && styles.mitChipTextSelected]}
                  numberOfLines={1}
                >
                  {mit.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TextInput
        style={styles.input}
        value={intention}
        onChangeText={(text) => {
          setIntention(text);
          if (selectedMitId) setSelectedMitId(null);
        }}
        placeholder="e.g., Draft the Q2 project proposal introduction"
        placeholderTextColor={Colors.textSecondary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={500}
        accessibilityLabel="Sprint intention"
      />

      {activeConfigs.length > 0 && (
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Cognitive Hygiene Check</Text>
          <Text style={styles.checklistSubtitle}>Confirm your environment is ready</Text>

          {activeConfigs.map((config) => (
            <TouchableOpacity
              key={config.practice}
              style={styles.checkItem}
              onPress={() => toggleCheck(config.practice)}
              accessibilityLabel={`${config.label}: ${checks[config.practice] ? 'checked' : 'unchecked'}`}
              accessibilityRole="checkbox"
            >
              <Ionicons
                name={checks[config.practice] ? 'checkbox' : 'square-outline'}
                size={24}
                color={checks[config.practice] ? Colors.success : Colors.textSecondary}
              />
              <Text style={[styles.checkLabel, checks[config.practice] && styles.checkLabelDone]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}

          {!allChecked && (
            <Text style={styles.checkHint}>
              Complete your hygiene checklist for the best results
            </Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Begin Sprint"
          onPress={() => onStart(intention.trim(), checks, selectedMitId ?? undefined)}
          disabled={!canStart}
          accessibilityLabel="Begin focus sprint"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  checklistSection: {
    marginBottom: 32,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  checklistSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkLabel: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  checkLabelDone: {
    color: Colors.success,
  },
  checkHint: {
    fontSize: 13,
    color: Colors.warning,
    marginTop: 12,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 8,
  },
  // Energy phase coaching card
  energyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    marginBottom: 20,
    gap: 10,
  },
  energyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  energyCardWorkType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  energyCardSuggestion: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  workTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // MIT picker
  mitSection: {
    marginBottom: 16,
  },
  mitSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  mitChips: {
    gap: 8,
  },
  mitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mitChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15',
  },
  mitChipText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  mitChipTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
