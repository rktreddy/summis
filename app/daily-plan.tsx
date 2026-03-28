import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { PriorityCard } from '@/components/planner/PriorityCard';
import { DayReview } from '@/components/planner/DayReview';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import type { DailyPriority } from '@/types';

export default function DailyPlanScreen() {
  const router = useRouter();
  const { plan, hasTodayPlan, loading, createPlan, togglePriority, saveDayReview, getDefaultPriorities } = useDailyPlan();
  const [priorities, setPriorities] = useState<DailyPriority[]>(getDefaultPriorities);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const validPriorities = priorities.filter((p) => p.title.trim());
    if (validPriorities.length === 0) return;
    setSaving(true);
    try {
      await createPlan(validPriorities);
    } finally {
      setSaving(false);
    }
  }

  function handleUpdatePriority(index: number, updated: DailyPriority) {
    setPriorities((prev) => prev.map((p, i) => i === index ? updated : p));
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {showReview ? 'Day Review' : hasTodayPlan ? 'Today\'s Plan' : 'Plan Your Day'}
          </Text>
          {!hasTodayPlan && (
            <Text style={styles.subtitle}>
              Set your top 3 priorities. We'll suggest optimal timing.
            </Text>
          )}
        </View>

        {showReview && plan ? (
          <DayReview
            priorities={plan.priorities}
            onSave={(rating, notes) => {
              saveDayReview(rating, notes);
              setShowReview(false);
              router.back();
            }}
          />
        ) : hasTodayPlan && plan ? (
          <View style={styles.planView}>
            {plan.priorities.map((p, i) => (
              <PriorityCard
                key={p.id}
                priority={p}
                index={i}
                onChange={() => {}}
                onToggle={() => togglePriority(p.id)}
                editable={false}
              />
            ))}

            <View style={styles.planActions}>
              <Button
                title="Review Day"
                onPress={() => setShowReview(true)}
                variant="secondary"
                style={styles.actionBtn}
              />
            </View>

            {plan.day_rating != null && plan.day_rating > 0 && (
              <View style={styles.reviewSummary}>
                <Text style={styles.reviewLabel}>Day rating: {'★'.repeat(plan.day_rating)}</Text>
                {plan.review_notes ? (
                  <Text style={styles.reviewNotes}>{plan.review_notes}</Text>
                ) : null}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.createView}>
            {priorities.map((p, i) => (
              <PriorityCard
                key={p.id}
                priority={p}
                index={i}
                onChange={(updated) => handleUpdatePriority(i, updated)}
                onToggle={() => {}}
                editable
              />
            ))}

            <Button
              title="Set Plan"
              onPress={handleCreate}
              disabled={saving || priorities.every((p) => !p.title.trim())}
              loading={saving}
              style={styles.createBtn}
            />
          </View>
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
    marginBottom: 20,
  },
  backBtn: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  planView: {
    gap: 4,
  },
  planActions: {
    marginTop: 12,
  },
  actionBtn: {
    marginBottom: 8,
  },
  reviewSummary: {
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewLabel: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewNotes: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  createView: {
    gap: 4,
  },
  createBtn: {
    marginTop: 12,
  },
});
