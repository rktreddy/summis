/**
 * Spaced repetition intervals based on Cepeda et al. (2006).
 * Optimal review gaps increase as material becomes more familiar.
 */
const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // days

/**
 * Get the next optimal review date based on the last practice and review count.
 */
export function getNextReviewDate(lastPractice: Date, reviewCount: number): Date {
  const interval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
  const next = new Date(lastPractice);
  next.setDate(next.getDate() + interval);
  return next;
}

/**
 * Check if a review is due (current time >= next review date).
 */
export function isReviewDue(lastPractice: Date, reviewCount: number): boolean {
  return new Date() >= getNextReviewDate(lastPractice, reviewCount);
}

/**
 * Get a human-readable label for the next review timing.
 */
export function getReviewLabel(lastPractice: Date, reviewCount: number): string {
  const next = getNextReviewDate(lastPractice, reviewCount);
  const now = new Date();
  const diffMs = next.getTime() - now.getTime();

  if (diffMs <= 0) return 'Review due now';

  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) return 'Review due tomorrow';
  return `Review in ${diffDays} days`;
}

/**
 * Get the current interval in days for display.
 */
export function getCurrentInterval(reviewCount: number): number {
  return REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
}
