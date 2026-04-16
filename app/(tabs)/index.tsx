import { useState, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { useMITs } from '@/hooks/useMITs';
import { useSprints } from '@/hooks/useSprints';
import { useHygieneScore } from '@/hooks/useHygieneScore';
import { getTodayString } from '@/lib/date-utils';
import { MITCard } from '@/components/today/MITCard';
import { MITEntry } from '@/components/today/MITEntry';
import { HygieneScoreCard } from '@/components/today/HygieneScoreCard';
import { SprintScheduleCard } from '@/components/today/SprintScheduleCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import type { HygienePractice } from '@/types/summis';

export default function TodayScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const session = useAppStore((s) => s.session);
  const hygieneConfigs = useAppStore((s) => s.hygieneConfigs);
  const addHygieneLog = useAppStore((s) => s.addHygieneLog);
  const data = useData();

  const { todayMITs, canAddMIT, createMIT, toggleMIT, deleteMIT, maxMITs } = useMITs();
  const { completedToday, sprintStreak } = useSprints();
  const { score: hygieneScore, activeCount, compliantCount, todayLogs } = useHygieneScore();

  const dailyTarget = profile?.daily_sprint_target ?? 3;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.display_name ?? 'there';

  const todayFormatted = new Date().toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Hygiene log state
  const [showHygieneChecklist, setShowHygieneChecklist] = useState(false);
  const activeHygieneConfigs = hygieneConfigs.filter((c) => c.is_active);

  const isHygienePracticeLogged = useCallback((practice: string) => {
    return todayLogs.some((l) => l.practice === practice && l.compliant);
  }, [todayLogs]);

  async function handleToggleHygiene(practice: HygienePractice) {
    const userId = session?.user?.id;
    if (!userId) return;
    const todayStr = getTodayString();
    const alreadyLogged = todayLogs.find((l) => l.practice === practice);
    const newCompliant = !alreadyLogged?.compliant;

    const logData = { practice, date: todayStr, compliant: newCompliant, sprint_id: null as string | null };
    const optimisticLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      logged_at: new Date().toISOString(),
      ...logData,
    };
    addHygieneLog(optimisticLog);

    try {
      await data.createHygieneLog(userId, logData);
    } catch {
      // Optimistic — keep local state
    }
  }

  // Evening reflection state
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  async function handleSaveReflection() {
    const userId = session?.user?.id;
    if (!userId || dayRating === null) return;
    try {
      await data.updateDailyPlanReview(userId, getTodayString(), dayRating, reflectionNote);
      setReflectionSaved(true);
    } catch {
      // Fail silently — local state preserved
    }
  }

  function handleDeleteMIT(id: string) {
    if (Platform.OS === 'web') {
      if (confirm('Remove this MIT?')) deleteMIT(id);
    } else {
      deleteMIT(id);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, {displayName}</Text>
          <Text style={styles.date}>{todayFormatted}</Text>
        </View>

        {/* Cognitive Hygiene Score + Checklist */}
        <HygieneScoreCard
          score={hygieneScore}
          activeCount={activeCount}
          compliantCount={compliantCount}
          onPress={() => setShowHygieneChecklist((prev) => !prev)}
        />

        {showHygieneChecklist && activeHygieneConfigs.length > 0 && (
          <Card style={styles.hygieneChecklist}>
            <Text style={styles.hygieneChecklistTitle}>Today's Hygiene Check</Text>
            {activeHygieneConfigs.map((config) => {
              const checked = isHygienePracticeLogged(config.practice);
              return (
                <TouchableOpacity
                  key={config.practice}
                  style={styles.hygieneCheckItem}
                  onPress={() => handleToggleHygiene(config.practice)}
                  accessibilityLabel={`${config.label}: ${checked ? 'done' : 'not done'}`}
                  accessibilityRole="checkbox"
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checked ? Colors.success : Colors.textSecondary}
                  />
                  <Text style={[styles.hygieneCheckLabel, checked && styles.hygieneCheckLabelDone]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        {/* MITs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Important Tasks</Text>
          <View style={styles.mitList}>
            {todayMITs.map((mit) => (
              <MITCard
                key={mit.id}
                mit={mit}
                onToggle={toggleMIT}
                onDelete={handleDeleteMIT}
              />
            ))}
            {canAddMIT && (
              <MITEntry
                onAdd={createMIT}
                slotsRemaining={maxMITs - todayMITs.length}
              />
            )}
          </View>
          {todayMITs.length === 0 && (
            <Text style={styles.hint}>
              Set up to 3 Most Important Tasks for today. These are the things that matter most.
            </Text>
          )}
        </View>

        {/* Sprint Schedule */}
        <View style={styles.section}>
          <SprintScheduleCard
            completedToday={completedToday}
            dailyTarget={dailyTarget}
            sprintStreak={sprintStreak}
            onStartSprint={() => router.push('/(tabs)/sprint')}
          />
        </View>

        {/* Evening Reflection (after 6 PM) */}
        {hour >= 18 && (
          <Card style={styles.reflectionCard}>
            <Text style={styles.reflectionTitle}>Evening Reflection</Text>
            <Text style={styles.reflectionText}>
              You completed {completedToday.length} sprint{completedToday.length !== 1 ? 's' : ''} and{' '}
              {todayMITs.filter((m) => m.completed).length} of {todayMITs.length} MITs today.
            </Text>

            {reflectionSaved ? (
              <View style={styles.reflectionSaved}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.reflectionSavedText}>Reflection saved</Text>
              </View>
            ) : (
              <>
                <Text style={styles.ratingLabel}>How was your day?</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.ratingButton, dayRating === n && styles.ratingButtonActive]}
                      onPress={() => setDayRating(n)}
                      accessibilityLabel={`Rate day ${n} out of 5`}
                      accessibilityRole="radio"
                    >
                      <Text style={[styles.ratingButtonText, dayRating === n && styles.ratingButtonTextActive]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.reflectionInput}
                  value={reflectionNote}
                  onChangeText={setReflectionNote}
                  placeholder="One thought about today (optional)"
                  placeholderTextColor={Colors.textSecondary}
                  maxLength={200}
                  accessibilityLabel="Evening reflection note"
                />

                <Button
                  title="Save Reflection"
                  onPress={handleSaveReflection}
                  disabled={dayRating === null}
                  variant="secondary"
                  accessibilityLabel="Save evening reflection"
                />
              </>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  date: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  mitList: {
    gap: 10,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  // Hygiene checklist
  hygieneChecklist: {
    marginBottom: 16,
    marginTop: -8,
  },
  hygieneChecklistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  hygieneCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hygieneCheckLabel: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  hygieneCheckLabelDone: {
    color: Colors.success,
  },
  // Evening reflection
  reflectionCard: {
    marginTop: 8,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ratingButtonTextActive: {
    color: Colors.text,
  },
  reflectionInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  reflectionSaved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  reflectionSavedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
});
