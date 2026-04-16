/**
 * Tests for sprint lifecycle logic: validation, limits, and streak calculation.
 */
import { canStartSprint, FEATURES } from '@/lib/features';

describe('canStartSprint', () => {
  it('allows free users under daily limit', () => {
    expect(canStartSprint('free', 0)).toBe(true);
    expect(canStartSprint('free', 1)).toBe(true);
    expect(canStartSprint('free', 2)).toBe(true);
  });

  it('blocks free users at daily limit', () => {
    expect(canStartSprint('free', 3)).toBe(false);
    expect(canStartSprint('free', 5)).toBe(false);
  });

  it('allows pro users unlimited sprints', () => {
    expect(canStartSprint('pro', 0)).toBe(true);
    expect(canStartSprint('pro', 10)).toBe(true);
    expect(canStartSprint('pro', 100)).toBe(true);
  });

  it('allows lifetime users unlimited sprints', () => {
    expect(canStartSprint('lifetime', 0)).toBe(true);
    expect(canStartSprint('lifetime', 50)).toBe(true);
  });

  it('uses correct free tier limit from FEATURES', () => {
    expect(FEATURES.daily_sprints).toBe(3);
  });
});

describe('sprint input validation', () => {
  function validateIntention(intention: string): string | null {
    const trimmed = intention.trim();
    if (!trimmed) return 'Intention cannot be empty';
    if (trimmed.length > 500) return 'Intention too long (max 500 characters)';
    return null;
  }

  it('rejects empty intention', () => {
    expect(validateIntention('')).toBe('Intention cannot be empty');
    expect(validateIntention('   ')).toBe('Intention cannot be empty');
  });

  it('accepts valid intention', () => {
    expect(validateIntention('Draft the Q2 proposal')).toBeNull();
  });

  it('rejects intention over 500 characters', () => {
    const long = 'a'.repeat(501);
    expect(validateIntention(long)).toBe('Intention too long (max 500 characters)');
  });

  it('accepts intention at exactly 500 characters', () => {
    const exact = 'a'.repeat(500);
    expect(validateIntention(exact)).toBeNull();
  });
});

describe('sprint streak calculation', () => {
  function computeStreak(completedDates: string[], todayStr: string): number {
    const dates = new Set(completedDates);
    let streak = 0;
    const d = new Date(todayStr + 'T12:00:00');

    if (!dates.has(todayStr)) {
      d.setDate(d.getDate() - 1);
    }

    while (true) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      if (dates.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  it('counts consecutive days correctly', () => {
    const dates = ['2026-04-14', '2026-04-15', '2026-04-16'];
    expect(computeStreak(dates, '2026-04-16')).toBe(3);
  });

  it('returns 0 when no sprints completed', () => {
    expect(computeStreak([], '2026-04-16')).toBe(0);
  });

  it('breaks streak on gap day', () => {
    const dates = ['2026-04-13', '2026-04-15', '2026-04-16'];
    expect(computeStreak(dates, '2026-04-16')).toBe(2);
  });

  it('counts yesterday if today has no sprint yet', () => {
    const dates = ['2026-04-14', '2026-04-15'];
    expect(computeStreak(dates, '2026-04-16')).toBe(2);
  });

  it('returns 0 if yesterday had no sprint and today has none', () => {
    const dates = ['2026-04-13', '2026-04-14'];
    expect(computeStreak(dates, '2026-04-16')).toBe(0);
  });
});

describe('optimistic update rollback pattern', () => {
  it('restores previous state on failure', () => {
    // Simulate the rollback pattern used in completeSprint
    const originalSprint = {
      id: 'sprint-1',
      completed: false,
      phase: 'focus' as const,
      focus_quality: null as number | null,
      ended_at: null as string | null,
    };

    const updates = {
      completed: true,
      phase: 'reflection' as const,
      focus_quality: 4,
      ended_at: '2026-04-16T15:00:00Z',
    };

    // Apply optimistic update
    const optimistic = { ...originalSprint, ...updates };
    expect(optimistic.completed).toBe(true);
    expect(optimistic.focus_quality).toBe(4);

    // Simulate rollback
    const rolledBack = {
      ...optimistic,
      phase: originalSprint.phase,
      completed: originalSprint.completed,
      ended_at: originalSprint.ended_at,
      focus_quality: originalSprint.focus_quality,
    };
    expect(rolledBack.completed).toBe(false);
    expect(rolledBack.focus_quality).toBeNull();
    expect(rolledBack.phase).toBe('focus');
  });
});

describe('MIT input validation', () => {
  function validateMITTitle(title: string): boolean {
    const trimmed = title.trim();
    return trimmed.length > 0 && trimmed.length <= 200;
  }

  it('rejects empty title', () => {
    expect(validateMITTitle('')).toBe(false);
    expect(validateMITTitle('   ')).toBe(false);
  });

  it('accepts valid title', () => {
    expect(validateMITTitle('Write project proposal')).toBe(true);
  });

  it('rejects title over 200 characters', () => {
    expect(validateMITTitle('a'.repeat(201))).toBe(false);
  });

  it('accepts title at exactly 200 characters', () => {
    expect(validateMITTitle('a'.repeat(200))).toBe(true);
  });
});
