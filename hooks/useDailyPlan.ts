import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { getTodayDateString, createEmptyPriority } from '@/lib/daily-planner';
import type { DailyPlan, DailyPriority, Chronotype } from '@/types';

/**
 * Hook for managing the daily plan.
 * Persists via DataProvider (Supabase in real mode, in-memory mock in demo mode).
 */
export function useDailyPlan() {
  const session = useAppStore((s) => s.session);
  const profile = useAppStore((s) => s.profile);
  const data = useData();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const todayDate = getTodayDateString();
  const userId = session?.user?.id ?? 'demo-user-001';

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await data.fetchDailyPlan(userId, todayDate);
      setPlan(fetched);
    } catch (err) {
      console.error('Failed to fetch daily plan:', err);
    } finally {
      setLoading(false);
    }
  }, [data, userId, todayDate]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const createPlan = useCallback(async (priorities: DailyPriority[]) => {
    try {
      const saved = await data.upsertDailyPlan(userId, todayDate, priorities);
      setPlan(saved);
      return saved;
    } catch (err) {
      console.error('Failed to save daily plan:', err);
      // Fallback to local state so user isn't blocked
      const fallback: DailyPlan = {
        id: `dp-${Date.now()}`,
        user_id: userId,
        date: todayDate,
        priorities,
        review_notes: null,
        day_rating: null,
        created_at: new Date().toISOString(),
      };
      setPlan(fallback);
      return fallback;
    }
  }, [data, userId, todayDate]);

  const togglePriority = useCallback(async (priorityId: string) => {
    let updatedPriorities: DailyPriority[] | null = null;
    setPlan((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        priorities: prev.priorities.map((p) =>
          p.id === priorityId ? { ...p, completed: !p.completed } : p
        ),
      };
      updatedPriorities = updated.priorities;
      return updated;
    });
    if (updatedPriorities) {
      data.updateDailyPlanPriorities(userId, todayDate, updatedPriorities).catch((err) =>
        console.error('Failed to persist priority toggle:', err)
      );
    }
  }, [data, userId, todayDate]);

  const saveDayReview = useCallback(async (rating: number, notes: string) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, day_rating: rating, review_notes: notes };
    });
    try {
      await data.updateDailyPlanReview(userId, todayDate, rating, notes);
    } catch (err) {
      console.error('Failed to save day review:', err);
    }
  }, [data, userId, todayDate]);

  const getDefaultPriorities = useCallback((): DailyPriority[] => {
    const wakeTime = profile?.wake_time ?? undefined;
    const chronotype = (profile?.chronotype as Chronotype) ?? undefined;
    return [
      createEmptyPriority(0, wakeTime, chronotype),
      createEmptyPriority(1, wakeTime, chronotype),
      createEmptyPriority(2, wakeTime, chronotype),
    ];
  }, [profile?.wake_time, profile?.chronotype]);

  const hasTodayPlan = plan?.date === todayDate;

  return { plan, hasTodayPlan, loading, fetchPlan, createPlan, togglePriority, saveDayReview, getDefaultPriorities };
}
