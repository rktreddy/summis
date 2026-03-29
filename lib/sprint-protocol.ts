import type { SprintPhase, SprintDuration, ChronotypeCategory, EnergyPhase } from '@/types/summis';
import { getCurrentEnergyPhase, ENERGY_PHASE_INFO } from '@/lib/chronotype-engine';

// ── Sprint Protocol (Yousef) ─────────────────────────────────────────
// Based on Dr. Sahar Yousef's Becoming Superhuman focus sprint protocol.
// Phases: Intention (30s) → Focus (30-50 min) → Rest (5-10 min) → Reflection (10s)

export const SPRINT_DURATIONS: { label: string; minutes: SprintDuration; description: string }[] = [
  { label: '30 min', minutes: 30, description: 'Short sprint — great for getting started' },
  { label: '45 min', minutes: 45, description: 'Standard sprint — recommended for deep work' },
  { label: '50 min', minutes: 50, description: 'Extended sprint — for experienced focus workers' },
];

export const DEFAULT_SPRINT_DURATION: SprintDuration = 45;

export const SPRINT_PHASES: { phase: SprintPhase; label: string; description: string }[] = [
  {
    phase: 'intention',
    label: 'Set Intention',
    description: 'Write exactly what you will accomplish in this sprint.',
  },
  {
    phase: 'focus',
    label: 'Focus',
    description: 'Deep work. Minimal distractions. The phone is away.',
  },
  {
    phase: 'rest',
    label: 'Rest',
    description: 'Take a real break. Walk, stretch, look outside.',
  },
  {
    phase: 'reflection',
    label: 'Reflect',
    description: 'Rate your focus and review your intention.',
  },
];

/**
 * Get the rest duration based on sprint duration.
 * Yousef recommends 10-20% of sprint time for rest.
 */
export function getRestDuration(sprintMinutes: number): number {
  if (sprintMinutes <= 30) return 5;
  if (sprintMinutes <= 45) return 8;
  return 10;
}

/**
 * Get the next phase in the sprint protocol.
 */
export function getNextPhase(current: SprintPhase): SprintPhase | null {
  const order: SprintPhase[] = ['intention', 'focus', 'rest', 'reflection'];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1];
}

/**
 * Check if a phase is the final phase.
 */
export function isFinalPhase(phase: SprintPhase): boolean {
  return phase === 'reflection';
}

/**
 * Rest suggestions — shown during the rest phase.
 * Yousef emphasizes "genuine rest" — not checking your phone.
 */
export const REST_SUGGESTIONS = [
  'Take a short walk',
  'Stretch your body',
  'Look out a window at something far away',
  'Get a glass of water',
  'Close your eyes and breathe deeply',
  'Step outside for fresh air',
];

/**
 * Get a random rest suggestion.
 */
export function getRestSuggestion(): string {
  return REST_SUGGESTIONS[Math.floor(Math.random() * REST_SUGGESTIONS.length)];
}

/**
 * Focus quality labels for the 1-5 rating scale.
 */
export const FOCUS_QUALITY_LABELS: Record<number, string> = {
  1: 'Very distracted',
  2: 'Somewhat distracted',
  3: 'Moderate focus',
  4: 'Good focus',
  5: 'Deep focus — in the zone',
};

/**
 * Intention met labels.
 */
export const INTENTION_MET_LABELS = {
  yes: 'Fully accomplished',
  partially: 'Partially accomplished',
  no: 'Did not accomplish',
} as const;

// ── Energy-Phase-Aware Sprint Coaching ──

/**
 * Suggest the best type of work for the current energy phase.
 * Used in the Sprint Intention screen to guide what to work on.
 */
export function getWorkTypeSuggestion(
  chronotype: ChronotypeCategory,
  wakeTime: string,
  now?: Date
): { phase: EnergyPhase | null; suggestion: string; workTypes: string[] } {
  const current = getCurrentEnergyPhase(chronotype, wakeTime, now);

  if (!current) {
    return {
      phase: null,
      suggestion: 'You\'re outside your active energy windows. Consider lighter tasks or rest.',
      workTypes: ['review notes', 'plan tomorrow', 'light reading'],
    };
  }

  switch (current.phase) {
    case 'peak':
      return {
        phase: 'peak',
        suggestion: 'Your brain is at peak capacity. Tackle your hardest, most important work now.',
        workTypes: ['deep analysis', 'complex problem-solving', 'writing', 'strategic thinking', 'coding'],
      };
    case 'dip':
      return {
        phase: 'dip',
        suggestion: 'Your energy is dipping. This is best for routine tasks that don\'t need deep thinking.',
        workTypes: ['email', 'scheduling', 'admin tasks', 'simple reviews', 'data entry'],
      };
    case 'recovery':
      return {
        phase: 'recovery',
        suggestion: 'Your recovery window is ideal for creative and insight-driven work.',
        workTypes: ['brainstorming', 'creative writing', 'design work', 'ideation', 'lateral thinking'],
      };
    default:
      return {
        phase: null,
        suggestion: 'Focus on your most important work.',
        workTypes: [],
      };
  }
}

/**
 * Get a contextual message to show at the start of a sprint
 * based on the user's current energy phase.
 */
export function getSprintContextMessage(
  chronotype: ChronotypeCategory,
  wakeTime: string,
  now?: Date
): string {
  const current = getCurrentEnergyPhase(chronotype, wakeTime, now);

  if (!current) {
    return 'Focus on what matters most.';
  }

  const info = ENERGY_PHASE_INFO[current.phase];
  const minutesLeft = current.minutesRemaining;

  if (current.phase === 'peak') {
    return `You're in your ${info.label} window — ${minutesLeft} min left. Best for ${info.workType.toLowerCase()}.`;
  }

  if (current.phase === 'dip') {
    return `You're in your energy ${info.label}. Consider ${info.workType.toLowerCase()} or a short break.`;
  }

  return `${info.label} window — great for ${info.workType.toLowerCase()}. ${minutesLeft} min remaining.`;
}
