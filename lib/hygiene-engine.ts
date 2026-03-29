import type { HygienePractice, HygieneConfig, HygieneLog } from '@/types/summis';

// ── Default Practices (Free tier: first 3) ───────────────────────────

export interface HygienePracticeDefinition {
  practice: HygienePractice;
  label: string;
  description: string;
  scienceNote: string;
  isFreeDefault: boolean;
}

export const HYGIENE_PRACTICES: HygienePracticeDefinition[] = [
  {
    practice: 'phone_away',
    label: 'Phone in Another Room',
    description: 'Keep your phone physically out of reach during focus sprints.',
    scienceNote: 'Ward et al. (2017): Even a silent, face-down phone reduces working memory capacity and fluid intelligence.',
    isFreeDefault: true,
  },
  {
    practice: 'notifications_off',
    label: 'Non-Essential Notifications Off',
    description: 'Disable notifications from social media, news, shopping, and entertainment apps.',
    scienceNote: 'Each notification pulls attention even if not acted on — the switching cost accumulates.',
    isFreeDefault: true,
  },
  {
    practice: 'dnd_active',
    label: 'Do Not Disturb Enabled',
    description: 'Enable system Do Not Disturb during sprints to block all interruptions.',
    scienceNote: 'Eliminating the possibility of interruption reduces cognitive vigilance overhead.',
    isFreeDefault: true,
  },
  {
    practice: 'environment_clear',
    label: 'Clear Workspace',
    description: 'Remove visual distractions from your workspace before starting.',
    scienceNote: 'Visual clutter competes for attention and reduces working memory capacity.',
    isFreeDefault: false,
  },
  {
    practice: 'no_email',
    label: 'Email & Chat Closed',
    description: 'Close email and messaging apps during focus sprints.',
    scienceNote: 'Async communication creates phantom attention pulls — you wonder if someone replied.',
    isFreeDefault: false,
  },
  {
    practice: 'same_stimuli',
    label: 'Consistent Focus Environment',
    description: 'Use the same music, drink, or location to create a focus cue.',
    scienceNote: 'Context-dependent memory: consistent environmental cues help your brain enter focus faster (Godden & Baddeley, 1975).',
    isFreeDefault: false,
  },
  {
    practice: 'grayscale',
    label: 'Phone in Grayscale',
    description: 'Set your phone display to grayscale to reduce its visual appeal.',
    scienceNote: 'Color activates reward pathways — grayscale makes the phone less neurologically compelling.',
    isFreeDefault: false,
  },
];

export const FREE_PRACTICES = HYGIENE_PRACTICES.filter((p) => p.isFreeDefault);
export const PRO_PRACTICES = HYGIENE_PRACTICES.filter((p) => !p.isFreeDefault);

// ── Compliance Score ─────────────────────────────────────────────────

/**
 * Compute today's cognitive hygiene compliance score (0-100).
 * Score = (compliant practices / active practices) * 100
 */
export function computeHygieneScore(
  configs: HygieneConfig[],
  logs: HygieneLog[],
  date: string
): number {
  const activeConfigs = configs.filter((c) => c.is_active);
  if (activeConfigs.length === 0) return 0;

  const todayLogs = logs.filter((l) => l.date === date);
  let compliant = 0;

  for (const config of activeConfigs) {
    const log = todayLogs.find((l) => l.practice === config.practice);
    if (log?.compliant) compliant++;
  }

  return Math.round((compliant / activeConfigs.length) * 100);
}

/**
 * Get default hygiene configs for a new user.
 * Returns the 3 free-tier practices as active configs.
 */
export function getDefaultHygieneConfigs(userId: string): Omit<HygieneConfig, 'id' | 'created_at'>[] {
  return FREE_PRACTICES.map((p) => ({
    user_id: userId,
    practice: p.practice,
    label: p.label,
    description: p.scienceNote,
    is_active: true,
  }));
}

/**
 * Build the pre-sprint hygiene checklist from active configs.
 */
export function getPreSprintChecklist(configs: HygieneConfig[]): { practice: HygienePractice; label: string }[] {
  return configs
    .filter((c) => c.is_active)
    .map((c) => ({ practice: c.practice, label: c.label }));
}
