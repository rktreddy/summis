import { useMemo } from 'react';
import type { HabitWithCompletions } from '@/types';
import { isCompletedToday } from '@/lib/date-utils';

export function useStreak(habit: HabitWithCompletions) {
  const currentStreak = habit.currentStreak;

  const longestStreak = useMemo(() => {
    if (habit.completions.length === 0) return 0;

    const dates = habit.completions
      .map((c) => {
        const d = new Date(c.completed_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b);

    let longest = 1;
    let current = 1;
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] - dates[i - 1] === oneDay) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }, [habit.completions]);

  const completedToday = useMemo(
    () => isCompletedToday(habit.completions),
    [habit.completions]
  );

  return { currentStreak, longestStreak, completedToday };
}
