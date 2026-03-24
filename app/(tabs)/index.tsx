import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Share,
} from 'react-native';
import { useHabits } from '@/hooks/useHabits';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppStore } from '@/store/useAppStore';
import { StreakShareCard } from '@/components/social/StreakShareCard';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { DailyTimeline } from '@/components/insights/DailyTimeline';
import { RecoveryCard } from '@/components/insights/RecoveryCard';
import { PartnerCard } from '@/components/social/PartnerCard';
import { ChallengeCard } from '@/components/social/ChallengeCard';
import { useRecoveryScore } from '@/hooks/useRecoveryScore';
import { useAccountability } from '@/hooks/useAccountability';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { getPlanCompletionRate } from '@/lib/daily-planner';
import { Colors } from '@/constants/Colors';
import { isCompletedToday } from '@/lib/date-utils';
import type { HabitWithCompletions, Chronotype } from '@/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const router = useRouter();
  const { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion, isLoading } =
    useHabits();
  const { canAddHabit } = useSubscription();
  const profile = useAppStore((s) => s.profile);
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);
  const milestoneHabit = useAppStore((s) => s.milestoneHabit);
  const setMilestoneHabit = useAppStore((s) => s.setMilestoneHabit);
  const { input: recoveryInput, compute: computeRecovery } = useRecoveryScore();
  const { partner, challenges, fetchPartner } = useAccountability();
  const { plan, hasTodayPlan } = useDailyPlan();

  useEffect(() => {
    computeRecovery();
    fetchPartner();
  }, [computeRecovery, fetchPartner]);
  const [showForm, setShowForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const stats = useMemo(() => {
    let completedCount = 0;
    let bestStreak = 0;

    for (const habit of habits) {
      if (isCompletedToday(habit.completions)) completedCount++;
      if (habit.currentStreak > bestStreak) bestStreak = habit.currentStreak;
    }

    return { completedCount, total: habits.length, bestStreak };
  }, [habits]);

  const handleCreateHabit = async (data: {
    title: string;
    description?: string;
    category?: string | null;
    science_note?: string;
    difficulty?: 'easy' | 'moderate' | 'hard';
    trigger_cue?: string;
  }) => {
    try {
      await createHabit({
        title: data.title,
        description: data.description,
        category: data.category as HabitWithCompletions['category'],
        difficulty: data.difficulty,
        trigger_cue: data.trigger_cue,
      });
      setShowForm(false);
    } catch {
      // Error handled in hook
    }
  };

  const renderHabit = ({ item }: { item: HabitWithCompletions }) => (
    <HabitCard
      habit={item}
      onToggle={() => toggleHabitCompletion(item.id)}
      onDelete={() => deleteHabit(item.id)}
    />
  );

  const displayName = profile?.display_name ?? 'there';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {displayName}
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats.completedCount}/{stats.total}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {stats.bestStreak > 0 ? `\uD83D\uDD25 ${stats.bestStreak}` : '\u2014'}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </Card>
      </View>

      {recoveryInput && (
        <View style={styles.timelineWrap}>
          <RecoveryCard input={recoveryInput} />
        </View>
      )}

      {profile?.wake_time && profile?.chronotype && (
        <View style={styles.timelineWrap}>
          <DailyTimeline
            wakeTime={profile.wake_time}
            chronotype={profile.chronotype as Chronotype}
          />
        </View>
      )}

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => { setError(null); fetchHabits(); }}
          onDismiss={() => setError(null)}
        />
      )}

      {partner && partner.status === 'active' && (
        <View style={styles.timelineWrap}>
          <PartnerCard partner={partner} onPress={() => router.push('/accountability')} />
          {challenges.filter((c) => !c.completed_at).slice(0, 1).map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              userName="You"
              partnerName={partner.partner_name ?? 'Partner'}
            />
          ))}
        </View>
      )}

      {!hasTodayPlan && (
        <View style={styles.timelineWrap}>
          <TouchableOpacity
            style={styles.planPrompt}
            onPress={() => router.push('/daily-plan')}
            accessibilityLabel="Plan your day"
          >
            <Text style={styles.planPromptIcon}>{'\uD83D\uDCCB'}</Text>
            <View style={styles.planPromptText}>
              <Text style={styles.planPromptTitle}>Plan Your Day</Text>
              <Text style={styles.planPromptDesc}>Set your top 3 priorities</Text>
            </View>
            <Text style={styles.planPromptArrow}>{'\u203A'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasTodayPlan && plan && (
        <View style={styles.timelineWrap}>
          <TouchableOpacity
            style={styles.planSummary}
            onPress={() => router.push('/daily-plan')}
            accessibilityLabel="View today's plan"
          >
            <Text style={styles.planSummaryTitle}>
              Today's Plan — {getPlanCompletionRate(plan.priorities)}% done
            </Text>
            {plan.priorities.map((p) => (
              <Text key={p.id} style={[styles.planSummaryItem, p.completed && styles.planSummaryDone]}>
                {p.completed ? '\u2705' : '\u25CB'} {p.title || '(empty)'}
              </Text>
            ))}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first science-backed habit
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchHabits}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (canAddHabit(habits.length)) {
            setShowForm(true);
          } else {
            setShowPaywall(true);
          }
        }}
        accessibilityLabel="Add new habit"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <HabitForm onSubmit={handleCreateHabit} onCancel={() => setShowForm(false)} />
          </View>
        </View>
      </Modal>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => { fetchHabits(); }}
      />

      {milestoneHabit && (
        <StreakShareCard
          streakCount={milestoneHabit.streak}
          habitName={milestoneHabit.habitName}
          onShare={async () => {
            await Share.share({
              message: `I just hit a ${milestoneHabit.streak}-day streak on ${milestoneHabit.habitName} with 1000x! \uD83D\uDD25`,
            });
            setMilestoneHabit(null);
          }}
          onDismiss={() => setMilestoneHabit(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timelineWrap: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  planPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  planPromptIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planPromptText: {
    flex: 1,
  },
  planPromptTitle: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  planPromptDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  planPromptArrow: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '300',
  },
  planSummary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planSummaryTitle: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  planSummaryItem: {
    color: Colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  planSummaryDone: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    color: Colors.text,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
});
