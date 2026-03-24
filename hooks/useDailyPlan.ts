import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTodayDateString, createEmptyPriority } from '@/lib/daily-planner';
import type { DailyPlan, DailyPriority, Chronotype } from '@/types';

/**
 * Hook for managing the daily plan.
 * Persists to Supabase in real mode, in-memory in demo mode.
 */
export function useDailyPlan() {
  const session = useAppStore((s) => s.session);
  const profile = useAppStore((s) => s.profile);
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const todayDate = getTodayDateString();

  const fetchPlan = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      // TODO: fetch from Supabase when connected
      // For now, plan is ephemeral (in-memory)
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const createPlan = useCallback((priorities: DailyPriority[]) => {
    const newPlan: DailyPlan = {
      id: `dp-${Date.now()}`,
      user_id: session?.user?.id ?? 'demo-user-001',
      date: todayDate,
      priorities,
      review_notes: null,
      day_rating: null,
      created_at: new Date().toISOString(),
    };
    setPlan(newPlan);
    return newPlan;
  }, [session?.user?.id, todayDate]);

  const togglePriority = useCallback((priorityId: string) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        priorities: prev.priorities.map((p) =>
          p.id === priorityId ? { ...p, completed: !p.completed } : p
        ),
      };
    });
  }, []);

  const saveDayReview = useCallback((rating: number, notes: string) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, day_rating: rating, review_notes: notes };
    });
    // TODO: upsert to Supabase
  }, []);

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
