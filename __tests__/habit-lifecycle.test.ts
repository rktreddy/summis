import { calculateStreak } from '@/lib/science';
import { isCompletedToday, findTodayCompletion } from '@/lib/date-utils';
import { isMilestone } from '@/lib/streak-milestones';
import type { HabitCompletion, HabitWithCompletions } from '@/types';

const daysAgo = (d: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
};

function makeCompletion(habitId: string, daysBack: number, id?: string): HabitCompletion {
  return {
    id: id ?? `c-${daysBack}`,
    habit_id: habitId,
    user_id: 'test-user',
    completed_at: daysAgo(daysBack),
    note: null,
    quality_rating: null,
  };
}

function makeHabit(overrides?: Partial<HabitWithCompletions>): HabitWithCompletions {
  return {
    id: 'h-test',
    user_id: 'test-user',
    title: 'Test Habit',
    description: null,
    science_note: null,
    category: 'general',
    frequency: 'daily',
    target_time: null,
    color: null,
    icon: null,
    difficulty: 'moderate',
    trigger_cue: null,
    is_active: true,
    sort_order: 0,
    created_at: daysAgo(30),
    completions: [],
    currentStreak: 0,
    ...overrides,
  };
}

describe('Habit Lifecycle', () => {
  describe('creation', () => {
    it('new habit starts with empty completions and zero streak', () => {
      const habit = makeHabit();
      expect(habit.completions).toEqual([]);
      expect(habit.currentStreak).toBe(0);
      expect(isCompletedToday(habit.completions)).toBe(false);
    });

    it('new habit has correct defaults', () => {
      const habit = makeHabit();
      expect(habit.is_active).toBe(true);
      expect(habit.difficulty).toBe('moderate');
      expect(habit.frequency).toBe('daily');
    });
  });

  describe('toggle completion', () => {
    it('adding today completion makes isCompletedToday true', () => {
      const completions = [makeCompletion('h-test', 0)];
      expect(isCompletedToday(completions)).toBe(true);
    });

    it('findTodayCompletion returns the completion for today', () => {
      const todayComp = makeCompletion('h-test', 0, 'today-comp');
      const completions = [makeCompletion('h-test', 1), todayComp];
      const found = findTodayCompletion(completions);
      expect(found).toBeDefined();
      expect(found!.id).toBe('today-comp');
    });

    it('findTodayCompletion returns undefined when no today completion', () => {
      const completions = [makeCompletion('h-test', 1), makeCompletion('h-test', 2)];
      expect(findTodayCompletion(completions)).toBeUndefined();
    });
  });

  describe('streak calculation', () => {
    it('consecutive days from today builds streak', () => {
      const completions = [
        makeCompletion('h-test', 0),
        makeCompletion('h-test', 1),
        makeCompletion('h-test', 2),
      ];
      expect(calculateStreak(completions)).toBe(3);
    });

    it('gap in completions breaks streak', () => {
      const completions = [
        makeCompletion('h-test', 0),
        makeCompletion('h-test', 1),
        // gap at day 2
        makeCompletion('h-test', 3),
      ];
      expect(calculateStreak(completions)).toBe(2);
    });

    it('no completions returns zero streak', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('only yesterday completion counts if today not done yet', () => {
      const completions = [
        makeCompletion('h-test', 1),
        makeCompletion('h-test', 2),
      ];
      expect(calculateStreak(completions)).toBe(2);
    });
  });

  describe('streak milestones', () => {
    it('detects 7-day milestone', () => {
      expect(isMilestone(7)).toBe(true);
    });

    it('detects 14-day milestone', () => {
      expect(isMilestone(14)).toBe(true);
    });

    it('detects 30-day milestone', () => {
      expect(isMilestone(30)).toBe(true);
    });

    it('detects 60-day milestone', () => {
      expect(isMilestone(60)).toBe(true);
    });

    it('detects 100-day milestone', () => {
      expect(isMilestone(100)).toBe(true);
    });

    it('non-milestone streaks return false', () => {
      expect(isMilestone(1)).toBe(false);
      expect(isMilestone(5)).toBe(false);
      expect(isMilestone(15)).toBe(false);
      expect(isMilestone(29)).toBe(false);
    });
  });

  describe('optimistic update rollback simulation', () => {
    it('simulates optimistic add then rollback on failure', () => {
      const habit = makeHabit({
        completions: [makeCompletion('h-test', 1)],
        currentStreak: 1,
      });

      // Optimistic add
      const optimisticCompletions = [
        ...habit.completions,
        makeCompletion('h-test', 0, 'temp-optimistic'),
      ];
      const optimisticStreak = calculateStreak(optimisticCompletions);
      expect(optimisticStreak).toBe(2);
      expect(isCompletedToday(optimisticCompletions)).toBe(true);

      // Rollback
      const rolledBack = habit.completions;
      const rolledBackStreak = habit.currentStreak;
      expect(isCompletedToday(rolledBack)).toBe(false);
      expect(rolledBackStreak).toBe(1);
    });

    it('simulates optimistic remove then rollback on failure', () => {
      const todayComp = makeCompletion('h-test', 0, 'today-id');
      const habit = makeHabit({
        completions: [todayComp, makeCompletion('h-test', 1)],
        currentStreak: 2,
      });

      // Optimistic remove
      const optimisticCompletions = habit.completions.filter(c => c.id !== 'today-id');
      expect(isCompletedToday(optimisticCompletions)).toBe(false);

      // Rollback
      expect(isCompletedToday(habit.completions)).toBe(true);
      expect(habit.currentStreak).toBe(2);
    });
  });

  describe('soft delete', () => {
    it('soft delete preserves habit data with is_active=false', () => {
      const habit = makeHabit({
        completions: [makeCompletion('h-test', 0), makeCompletion('h-test', 1)],
        currentStreak: 2,
      });

      // Simulate soft delete
      const deleted = { ...habit, is_active: false };
      expect(deleted.is_active).toBe(false);
      expect(deleted.completions.length).toBe(2); // completions preserved
    });
  });
});
