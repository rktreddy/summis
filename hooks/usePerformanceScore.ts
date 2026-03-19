import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import type { PerformanceScore } from '@/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function usePerformanceScore() {
  const session = useAppStore((s) => s.session);
  const habits = useAppStore((s) => s.habits);
  const data = useData();
  const [currentScore, setCurrentScore] = useState<PerformanceScore | null>(null);
  const [previousScore, setPreviousScore] = useState<PerformanceScore | null>(null);
  const [loading, setLoading] = useState(false);

  const computeAndSave = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setLoading(true);

    try {
      const now = new Date();
      const weekStart = getWeekStart(now);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Habit score: completion rate for the last 7 days
      let totalPossible = habits.length * 7;
      let totalCompleted = 0;

      for (const habit of habits) {
        const weekCompletions = habit.completions.filter((c) => {
          const t = new Date(c.completed_at);
          return t >= sevenDaysAgo && t <= now;
        });
        const uniqueDays = new Set(
          weekCompletions.map((c) => new Date(c.completed_at).toDateString())
        );
        totalCompleted += uniqueDays.size;
      }

      const habitScore =
        totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      // Focus score: based on focus sessions this week
      const focusSessions = await data.fetchFocusSessions(userId, sevenDaysAgo);
      const totalFocusMinutes = focusSessions.reduce(
        (sum, s) => sum + s.duration_minutes,
        0
      );
      const focusScore = Math.min(100, Math.round((totalFocusMinutes / 600) * 100));

      // Consistency score: how many days this week had at least one habit completion
      const daysWithActivity = new Set<string>();
      for (const habit of habits) {
        for (const c of habit.completions) {
          const t = new Date(c.completed_at);
          if (t >= sevenDaysAgo && t <= now) {
            daysWithActivity.add(t.toDateString());
          }
        }
      }
      const consistencyScore = Math.round((daysWithActivity.size / 7) * 100);

      // Overall: weighted average
      const overallScore = Math.round(
        habitScore * 0.4 + focusScore * 0.3 + consistencyScore * 0.3
      );

      // Upsert score
      const saved = await data.upsertPerformanceScore(userId, weekStart, {
        overall_score: overallScore,
        habit_score: habitScore,
        focus_score: focusScore,
        consistency_score: consistencyScore,
      });

      if (saved) {
        setCurrentScore(saved);
      }

      // Fetch previous week's score
      const prevWeekDate = new Date(now);
      prevWeekDate.setDate(prevWeekDate.getDate() - 7);
      const prevWeekStart = getWeekStart(prevWeekDate);

      const prev = await data.fetchPerformanceScore(userId, prevWeekStart);
      setPreviousScore(prev);
    } catch (err) {
      console.error('Error computing performance score:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, habits, data]);

  const delta =
    currentScore?.overall_score != null && previousScore?.overall_score != null
      ? currentScore.overall_score - previousScore.overall_score
      : null;

  return { currentScore, previousScore, delta, computeAndSave, loading };
}
