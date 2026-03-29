// ── Chronotype Engine ──────────────────────────────────────────────────
// Three-category chronotype model with Peak → Dip → Recovery energy phases.
// Based on standard chronobiology research (Horne & Östberg, 1976) and
// Dr. Sahar Yousef's "Becoming Superhuman" framework at UC Berkeley Haas.
//
// Terminology:
//   AM-Shifted  = Morning Type (academic: "morningness")
//   Bi-Phasic   = Intermediate Type — two distinct energy peaks per day
//   PM-Shifted  = Evening Type (academic: "eveningness")
//
// The Peak → Dip → Recovery structure is universal across all chronotypes.
// Only the timing shifts.

import type { ChronotypeCategory, EnergyPhase, ChronotypeProfile, EnergyWindow } from '@/types/summis';

// ── Chronotype Definitions ──

export const CHRONOTYPE_DEFINITIONS: {
  key: ChronotypeCategory;
  label: string;
  population: string;
  description: string;
  wakeTimeDefault: string;
  sleepTimeDefault: string;
  icon: string;
}[] = [
  {
    key: 'am_shifted',
    label: 'AM-Shifted',
    population: '20-25% of people',
    description: 'You feel sharpest in the morning and wind down by evening. Your best deep work happens before noon.',
    wakeTimeDefault: '06:00',
    sleepTimeDefault: '22:00',
    icon: 'sunny-outline',
  },
  {
    key: 'bi_phasic',
    label: 'Bi-Phasic',
    population: '50-55% of people',
    description: 'You have two energy peaks — mid-morning and early evening — with a dip after lunch. Most people fall here.',
    wakeTimeDefault: '07:00',
    sleepTimeDefault: '23:00',
    icon: 'swap-horizontal-outline',
  },
  {
    key: 'pm_shifted',
    label: 'PM-Shifted',
    population: '15-20% of people',
    description: 'Your energy builds through the day and peaks in the afternoon or evening. Mornings feel sluggish.',
    wakeTimeDefault: '08:30',
    sleepTimeDefault: '00:00',
    icon: 'moon-outline',
  },
];

// ── Energy Phase Definitions ──

export const ENERGY_PHASE_INFO: Record<EnergyPhase, {
  label: string;
  workType: string;
  description: string;
  color: string;
}> = {
  peak: {
    label: 'Peak',
    workType: 'Analytical & deep work',
    description: 'Your brain is at maximum capacity for complex, cognitively demanding tasks.',
    color: '#4CAF50',
  },
  dip: {
    label: 'Dip',
    workType: 'Administrative tasks',
    description: 'Energy is lower — ideal for email, meetings, simple tasks. Plan a break or short nap.',
    color: '#FF9800',
  },
  recovery: {
    label: 'Recovery',
    workType: 'Creative & insight work',
    description: 'Reduced inhibition enables creative connections. Good for brainstorming and creative problem-solving.',
    color: '#2196F3',
  },
};

// ── Energy Windows by Chronotype ──
// All times are hours after wake time, expressed as [startOffset, endOffset]

interface EnergyWindowOffsets {
  peak: { start: number; end: number };
  dip: { start: number; end: number };
  recovery: { start: number; end: number };
  secondPeak?: { start: number; end: number }; // Bi-Phasic only
}

const ENERGY_OFFSETS: Record<ChronotypeCategory, EnergyWindowOffsets> = {
  am_shifted: {
    // Wake ~6 AM: Peak 6-11 (0-5h), Dip 11-3 (5-9h), Recovery 3-7 (9-13h)
    peak: { start: 0.5, end: 5 },
    dip: { start: 5, end: 9 },
    recovery: { start: 9, end: 13 },
  },
  bi_phasic: {
    // Wake ~7 AM: Peak 9-1 (2-6h), Dip 1-4 (6-9h), Recovery 4-9 (9-14h)
    peak: { start: 2, end: 6 },
    dip: { start: 6, end: 9 },
    recovery: { start: 9, end: 12 },
    secondPeak: { start: 9, end: 12 }, // Early evening = creative/insight window
  },
  pm_shifted: {
    // Wake ~8:30 AM: Dip 8:30-12 (0-3.5h), Peak 12-6 (3.5-9.5h), Recovery 6-10 (9.5-13.5h)
    dip: { start: 0, end: 3.5 },
    peak: { start: 3.5, end: 9.5 },
    recovery: { start: 9.5, end: 13.5 },
  },
};

// ── Helper: Parse time string to hours ──

function parseTimeToHours(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

// ── Helper: Hours to time string ──

function hoursToTimeString(hours: number): string {
  // Handle day overflow
  const normalized = ((hours % 24) + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.round((normalized - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Compute Energy Windows ──

export function computeEnergyWindows(
  chronotype: ChronotypeCategory,
  wakeTime: string
): EnergyWindow[] {
  const wakeHours = parseTimeToHours(wakeTime);
  const offsets = ENERGY_OFFSETS[chronotype];

  const windows: EnergyWindow[] = [];

  // For PM-Shifted, the dip comes first (morning sluggishness)
  if (chronotype === 'pm_shifted') {
    windows.push({
      phase: 'dip',
      startTime: hoursToTimeString(wakeHours + offsets.dip.start),
      endTime: hoursToTimeString(wakeHours + offsets.dip.end),
      durationHours: offsets.dip.end - offsets.dip.start,
    });
    windows.push({
      phase: 'peak',
      startTime: hoursToTimeString(wakeHours + offsets.peak.start),
      endTime: hoursToTimeString(wakeHours + offsets.peak.end),
      durationHours: offsets.peak.end - offsets.peak.start,
    });
    windows.push({
      phase: 'recovery',
      startTime: hoursToTimeString(wakeHours + offsets.recovery.start),
      endTime: hoursToTimeString(wakeHours + offsets.recovery.end),
      durationHours: offsets.recovery.end - offsets.recovery.start,
    });
  } else {
    // AM-Shifted and Bi-Phasic: Peak comes first
    windows.push({
      phase: 'peak',
      startTime: hoursToTimeString(wakeHours + offsets.peak.start),
      endTime: hoursToTimeString(wakeHours + offsets.peak.end),
      durationHours: offsets.peak.end - offsets.peak.start,
    });
    windows.push({
      phase: 'dip',
      startTime: hoursToTimeString(wakeHours + offsets.dip.start),
      endTime: hoursToTimeString(wakeHours + offsets.dip.end),
      durationHours: offsets.dip.end - offsets.dip.start,
    });
    windows.push({
      phase: 'recovery',
      startTime: hoursToTimeString(wakeHours + offsets.recovery.start),
      endTime: hoursToTimeString(wakeHours + offsets.recovery.end),
      durationHours: offsets.recovery.end - offsets.recovery.start,
    });
  }

  return windows;
}

// ── Get Current Energy Phase ──

export function getCurrentEnergyPhase(
  chronotype: ChronotypeCategory,
  wakeTime: string,
  now?: Date
): { phase: EnergyPhase; window: EnergyWindow; minutesRemaining: number } | null {
  const currentTime = now ?? new Date();
  const currentHours = currentTime.getHours() + currentTime.getMinutes() / 60;
  const windows = computeEnergyWindows(chronotype, wakeTime);

  for (const w of windows) {
    const start = parseTimeToHours(w.startTime);
    const end = parseTimeToHours(w.endTime);

    // Handle windows that cross midnight
    if (end < start) {
      if (currentHours >= start || currentHours < end) {
        const minutesRemaining =
          currentHours >= start
            ? (24 - currentHours + end) * 60
            : (end - currentHours) * 60;
        return { phase: w.phase, window: w, minutesRemaining: Math.round(minutesRemaining) };
      }
    } else if (currentHours >= start && currentHours < end) {
      const minutesRemaining = (end - currentHours) * 60;
      return { phase: w.phase, window: w, minutesRemaining: Math.round(minutesRemaining) };
    }
  }

  return null;
}

// ── Sprint Timing Advice ──

export function getSprintAdvice(
  chronotype: ChronotypeCategory,
  wakeTime: string,
  now?: Date
): string {
  const current = getCurrentEnergyPhase(chronotype, wakeTime, now);

  if (!current) {
    return 'Outside your active energy windows. Rest and recharge for tomorrow.';
  }

  switch (current.phase) {
    case 'peak':
      return `You're in your Peak window — ideal for deep, analytical work. ${current.minutesRemaining} min remaining.`;
    case 'dip':
      return `You're in your energy Dip — best for admin tasks, email, or a short break. Deep work will feel harder right now.`;
    case 'recovery':
      return `You're in your Recovery window — great for creative work, brainstorming, and insight tasks.`;
    default:
      return 'Focus on your most important work.';
  }
}

// ── Compute Full Chronotype Profile ──

export function computeChronotypeProfile(
  chronotype: ChronotypeCategory,
  wakeTime: string
): ChronotypeProfile {
  const wakeHours = parseTimeToHours(wakeTime);
  const windows = computeEnergyWindows(chronotype, wakeTime);
  const peakWindow = windows.find((w) => w.phase === 'peak');
  const dipWindow = windows.find((w) => w.phase === 'dip');

  // Caffeine timing: 90 min after waking, cutoff 8-10h before sleep
  const def = CHRONOTYPE_DEFINITIONS.find((d) => d.key === chronotype);
  const sleepHours = def ? parseTimeToHours(def.sleepTimeDefault) : wakeHours + 16;
  const caffeineCutoff = hoursToTimeString(sleepHours - 8);
  const caffeineEarliest = hoursToTimeString(wakeHours + 1.5);

  // Nap window: during dip, 10-20 min only
  const napWindow = dipWindow
    ? {
        startTime: dipWindow.startTime,
        endTime: dipWindow.endTime,
        maxMinutes: 20,
        note: 'Power nap only: 20 min or 90 min. Nothing in between — sleep inertia.',
      }
    : null;

  return {
    chronotype,
    wakeTime,
    energyWindows: windows,
    peakWindowStart: peakWindow?.startTime ?? hoursToTimeString(wakeHours + 2),
    peakWindowEnd: peakWindow?.endTime ?? hoursToTimeString(wakeHours + 6),
    caffeineEarliest,
    caffeineCutoff,
    napWindow,
  };
}

// ── Chronotype Self-Assessment Helpers ──

export const CHRONOTYPE_QUESTIONS = [
  {
    question: 'If you had no obligations, what time would you naturally wake up?',
    answers: [
      { label: 'Before 7 AM', chronotype: 'am_shifted' as const },
      { label: '7 AM – 8:30 AM', chronotype: 'bi_phasic' as const },
      { label: 'After 8:30 AM', chronotype: 'pm_shifted' as const },
    ],
  },
  {
    question: 'When do you feel most mentally sharp?',
    answers: [
      { label: 'Early morning (before 10 AM)', chronotype: 'am_shifted' as const },
      { label: 'Late morning (10 AM – 1 PM)', chronotype: 'bi_phasic' as const },
      { label: 'Afternoon or evening', chronotype: 'pm_shifted' as const },
    ],
  },
  {
    question: 'When does your energy typically dip?',
    answers: [
      { label: 'Early afternoon (1-3 PM)', chronotype: 'am_shifted' as const },
      { label: 'Mid-afternoon (2-4 PM)', chronotype: 'bi_phasic' as const },
      { label: 'Late morning', chronotype: 'pm_shifted' as const },
    ],
  },
];

export function assessChronotype(
  answers: ChronotypeCategory[]
): ChronotypeCategory {
  const counts: Record<ChronotypeCategory, number> = {
    am_shifted: 0,
    bi_phasic: 0,
    pm_shifted: 0,
  };
  for (const a of answers) {
    counts[a]++;
  }
  // Return the most common answer, defaulting to bi_phasic on tie
  const sorted = (Object.entries(counts) as [ChronotypeCategory, number][])
    .sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === sorted[1][1]) return 'bi_phasic';
  return sorted[0][0];
}

// ── Attribution ──
// The chronotype framework (AM-Shifted, PM-Shifted, Bi-Phasic) is based on
// standard chronobiology research (Horne & Östberg, 1976) and informed by
// Dr. Sahar Yousef's "Becoming Superhuman: The Science of Productivity and
// Performance" curriculum at UC Berkeley Haas School of Business.
