import { getNextReviewDate, isReviewDue, getCurrentInterval, getReviewLabel } from '../lib/spaced-review';

describe('getNextReviewDate', () => {
  const base = new Date('2026-03-01T10:00:00Z');

  it('first review is 1 day after practice', () => {
    const next = getNextReviewDate(base, 0);
    expect(next.toISOString().split('T')[0]).toBe('2026-03-02');
  });

  it('second review is 3 days after practice', () => {
    const next = getNextReviewDate(base, 1);
    expect(next.toISOString().split('T')[0]).toBe('2026-03-04');
  });

  it('third review is 7 days after practice', () => {
    const next = getNextReviewDate(base, 2);
    expect(next.toISOString().split('T')[0]).toBe('2026-03-08');
  });

  it('fourth review is 14 days after practice', () => {
    const next = getNextReviewDate(base, 3);
    expect(next.toISOString().split('T')[0]).toBe('2026-03-15');
  });

  it('fifth review is 30 days after practice', () => {
    const next = getNextReviewDate(base, 4);
    expect(next.toISOString().split('T')[0]).toBe('2026-03-31');
  });

  it('stays at 30-day interval for review count > 4', () => {
    const r5 = getNextReviewDate(base, 5);
    const r10 = getNextReviewDate(base, 10);
    expect(r5.toISOString().split('T')[0]).toBe('2026-03-31');
    expect(r10.toISOString().split('T')[0]).toBe('2026-03-31');
  });
});

describe('isReviewDue', () => {
  it('returns true when past the review date', () => {
    const pastPractice = new Date();
    pastPractice.setDate(pastPractice.getDate() - 5);
    expect(isReviewDue(pastPractice, 0)).toBe(true); // 1-day interval, 5 days ago
  });

  it('returns false when before the review date', () => {
    const recentPractice = new Date(); // just now
    expect(isReviewDue(recentPractice, 0)).toBe(false); // 1-day interval, not yet
  });
});

describe('getCurrentInterval', () => {
  it('returns correct intervals', () => {
    expect(getCurrentInterval(0)).toBe(1);
    expect(getCurrentInterval(1)).toBe(3);
    expect(getCurrentInterval(2)).toBe(7);
    expect(getCurrentInterval(3)).toBe(14);
    expect(getCurrentInterval(4)).toBe(30);
    expect(getCurrentInterval(99)).toBe(30);
  });
});

describe('getReviewLabel', () => {
  it('returns "Review due now" for overdue reviews', () => {
    const old = new Date();
    old.setDate(old.getDate() - 10);
    expect(getReviewLabel(old, 0)).toBe('Review due now');
  });
});
