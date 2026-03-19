import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useHabits } from '@/hooks/useHabits';
import { useAppStore } from '@/store/useAppStore';
import { HabitCard } from '@/components/habits/HabitCard';
import { StreakRing } from '@/components/habits/StreakRing';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Colors } from '@/constants/Colors';
import { calculateConsistencyScore } from '@/lib/science';
import type { HabitWithCompletions } from '@/types';

export default function HabitsScreen() {
  const { habits, fetchHabits, toggleHabitCompletion, deleteHabit, isLoading } = useHabits();
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const renderHabit = ({ item }: { item: HabitWithCompletions }) => {
    const consistency = calculateConsistencyScore(item.completions, 30);

    return (
      <View style={styles.habitRow}>
        <View style={styles.streakColumn}>
          <StreakRing streak={item.currentStreak} size={44} />
        </View>
        <View style={styles.habitContent}>
          <HabitCard
            habit={item}
            onToggle={() => toggleHabitCompletion(item.id)}
            onDelete={() => deleteHabit(item.id)}
          />
          <Text style={styles.consistency}>{consistency}% consistency (30d)</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Habits</Text>
        <Text style={styles.subtitle}>{habits.length} active habits</Text>
      </View>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => { setError(null); fetchHabits(); }}
          onDismiss={() => setError(null)}
        />
      )}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={fetchHabits}
        ListEmptyComponent={
          <Card style={styles.empty}>
            <Text style={styles.emptyText}>
              Create habits from the Today tab to get started
            </Text>
          </Card>
        }
      />
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  streakColumn: {
    marginRight: 12,
    marginTop: 16,
  },
  habitContent: {
    flex: 1,
  },
  consistency: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: -6,
    marginBottom: 8,
    marginLeft: 16,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
