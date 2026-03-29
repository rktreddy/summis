import { ScrollView, View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useMITs } from '@/hooks/useMITs';
import { useSprints } from '@/hooks/useSprints';
import { useHygieneScore } from '@/hooks/useHygieneScore';
import { MITCard } from '@/components/today/MITCard';
import { MITEntry } from '@/components/today/MITEntry';
import { HygieneScoreCard } from '@/components/today/HygieneScoreCard';
import { SprintScheduleCard } from '@/components/today/SprintScheduleCard';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';

export default function TodayScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);

  const { todayMITs, canAddMIT, createMIT, toggleMIT, deleteMIT, maxMITs } = useMITs();
  const { completedToday, sprintStreak } = useSprints();
  const { score: hygieneScore, activeCount, compliantCount } = useHygieneScore();

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

        {/* Cognitive Hygiene Score */}
        <HygieneScoreCard
          score={hygieneScore}
          activeCount={activeCount}
          compliantCount={compliantCount}
        />

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
  },
});
