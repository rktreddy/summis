export type Chronotype = 'early' | 'moderate' | 'late';

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface DailySchedule {
  wakeTime: Date;
  firstPeak: TimeWindow;
  secondPeak: TimeWindow;
  caffeineCutoff: Date;
  windDownStart: Date;
  bedTime: Date;
}

// Chronotype offsets in minutes (shift peaks earlier/later)
const CHRONOTYPE_OFFSET: Record<Chronotype, number> = {
  early: -30,
  moderate: 0,
  late: 30,
};

/**
 * Parse "HH:MM" time string into a Date for today.
 */
export function parseTimeToday(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Format a Date to "h:mm AM/PM".
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Compute a full daily schedule from wake time and chronotype.
 *
 * Based on ultradian rhythm research (Kleitman/Lavie):
 * - First peak: 2.5h after waking (90-min window)
 * - Second peak: 6h after waking (90-min window)
 * - Bedtime: wake + 16h (targeting 8h sleep)
 * - Caffeine cutoff: bedtime - 8h (Drake et al., 2013)
 * - Wind-down: bedtime - 1h
 */
export function computeDailySchedule(
  wakeTime: string,
  chronotype: Chronotype = 'moderate'
): DailySchedule {
  const wake = parseTimeToday(wakeTime);
  const offset = CHRONOTYPE_OFFSET[chronotype];

  const firstPeakStart = new Date(wake.getTime() + (150 + offset) * 60000); // 2.5h + offset
  const firstPeakEnd = new Date(firstPeakStart.getTime() + 90 * 60000);

  const secondPeakStart = new Date(wake.getTime() + (360 + offset) * 60000); // 6h + offset
  const secondPeakEnd = new Date(secondPeakStart.getTime() + 90 * 60000);

  const bedTime = new Date(wake.getTime() + 16 * 60 * 60000); // wake + 16h
  const caffeineCutoff = new Date(bedTime.getTime() - 8 * 60 * 60000); // bed - 8h
  const windDownStart = new Date(bedTime.getTime() - 60 * 60000); // bed - 1h

  return {
    wakeTime: wake,
    firstPeak: { start: firstPeakStart, end: firstPeakEnd },
    secondPeak: { start: secondPeakStart, end: secondPeakEnd },
    caffeineCutoff,
    windDownStart,
    bedTime,
  };
}

export type WindowType = 'peak1' | 'peak2' | 'recovery' | 'wind-down' | 'sleep';

/**
 * Determine which window the current time falls in.
 */
export function getCurrentWindow(schedule: DailySchedule, now?: Date): WindowType {
  const t = now ?? new Date();
  const time = t.getTime();

  if (time >= schedule.firstPeak.start.getTime() && time < schedule.firstPeak.end.getTime()) {
    return 'peak1';
  }
  if (time >= schedule.secondPeak.start.getTime() && time < schedule.secondPeak.end.getTime()) {
    return 'peak2';
  }
  if (time >= schedule.windDownStart.getTime()) {
    return 'wind-down';
  }
  if (time < schedule.wakeTime.getTime()) {
    return 'sleep';
  }
  return 'recovery';
}

/**
 * Minutes until the next peak window starts. Returns 0 if currently in a peak.
 */
export function getNextPeakIn(schedule: DailySchedule, now?: Date): number {
  const t = now ?? new Date();
  const time = t.getTime();

  // Currently in a peak
  if (
    (time >= schedule.firstPeak.start.getTime() && time < schedule.firstPeak.end.getTime()) ||
    (time >= schedule.secondPeak.start.getTime() && time < schedule.secondPeak.end.getTime())
  ) {
    return 0;
  }

  // Before first peak
  if (time < schedule.firstPeak.start.getTime()) {
    return Math.round((schedule.firstPeak.start.getTime() - time) / 60000);
  }

  // Between peaks
  if (time < schedule.secondPeak.start.getTime()) {
    return Math.round((schedule.secondPeak.start.getTime() - time) / 60000);
  }

  // After both peaks — next peak is tomorrow's first peak (approximate)
  return null as unknown as number;
}

const WINDOW_LABELS: Record<WindowType, { label: string; emoji: string; color: string }> = {
  peak1: { label: 'Peak Focus', emoji: '\u26A1', color: '#22C55E' },
  peak2: { label: 'Peak Focus', emoji: '\u26A1', color: '#22C55E' },
  recovery: { label: 'Light Work', emoji: '\uD83D\uDCA4', color: '#7C5CFC' },
  'wind-down': { label: 'Wind Down', emoji: '\uD83C\uDF19', color: '#F59E0B' },
  sleep: { label: 'Sleep', emoji: '\uD83D\uDE34', color: '#6366F1' },
};

export function getWindowInfo(window: WindowType) {
  return WINDOW_LABELS[window];
}
