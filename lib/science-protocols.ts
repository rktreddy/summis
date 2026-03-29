/**
 * Curated science-backed protocols.
 * Each protocol has a name, description, citation, and actionable steps.
 * Citation format: Author (Year). Title. Journal.
 */

export interface ScienceProtocol {
  id: string;
  title: string;
  category: 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness' | 'recovery';
  summary: string;
  citation: string;
  steps: string[];
  durationMinutes: number | null;
  tier: 'free' | 'pro';
}

export const SCIENCE_PROTOCOLS: ScienceProtocol[] = [
  {
    id: 'ultradian-focus',
    title: '90-Minute Ultradian Focus Block',
    category: 'focus',
    summary:
      'The brain cycles through ~90-minute ultradian rhythms of higher and lower alertness. Aligning deep work sessions with these cycles maximises sustained attention.',
    citation:
      'Peretz Lavie (1985). Ultradian rhythms in human sleep and wakefulness. In Schulz & Lavie (Eds.), Ultradian Rhythms in Physiology and Behavior. Springer.',
    steps: [
      'Identify your first alertness peak (typically 2-3 hours after waking)',
      'Set a 90-minute timer and eliminate all distractions',
      'Work on a single cognitively demanding task',
      'After 90 minutes, take a 15-20 minute break (walk, stretch, no screens)',
      'Repeat for up to 3 blocks per day',
    ],
    durationMinutes: 90,
    tier: 'free',
  },
  {
    id: 'tiny-habits',
    title: '2-Minute Rule (Tiny Habits)',
    category: 'mindfulness',
    summary:
      'Starting with a habit that takes less than 2 minutes reduces friction and creates an "entry point" that scales naturally over time.',
    citation:
      'BJ Fogg (2019). Tiny Habits: The Small Changes That Change Everything. Houghton Mifflin Harcourt.',
    steps: [
      'Choose a habit you want to build',
      'Scale it down to a 2-minute version (e.g. "read 1 page" instead of "read 30 minutes")',
      'Anchor it after an existing habit ("After I pour my coffee, I will read 1 page")',
      'Celebrate immediately after completion (fist pump, smile, say "yes!")',
      'Only expand the habit once the 2-minute version is automatic (~2 weeks)',
    ],
    durationMinutes: 2,
    tier: 'free',
  },
  {
    id: 'spaced-repetition',
    title: 'Spaced Repetition for Skill Learning',
    category: 'focus',
    summary:
      'Reviewing material at increasing intervals dramatically improves long-term retention compared to massed practice.',
    citation:
      'Cepeda et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.',
    steps: [
      'After learning something new, review it after 1 day',
      'If recalled correctly, review again after 3 days',
      'Then 7 days, 14 days, 30 days',
      'If you fail a review, reset the interval to 1 day',
      'Use your journal to log what you are spacing',
    ],
    durationMinutes: null,
    tier: 'pro',
  },
  {
    id: 'morning-priming',
    title: 'Morning Priming Protocol',
    category: 'mindfulness',
    summary:
      'Combining light exposure, movement, and intentional breathing in the first hour after waking sets circadian rhythm and cortisol levels for optimal daytime performance.',
    citation:
      'Huberman, A. (2021). Optimizing workspace for productivity, focus, & creativity. Huberman Lab Podcast. Based on: Leproult et al. (2001). Transition from dim to bright light in the morning induces an immediate elevation of cortisol levels. JCEM.',
    steps: [
      'Within 30 minutes of waking, get 5-10 min of sunlight exposure (or bright light)',
      'Do 5 minutes of deliberate breathing (box breathing: 4s in, 4s hold, 4s out, 4s hold)',
      'Perform 2-5 minutes of light movement (stretching, walking)',
      'Write 3 intentions for the day in your journal',
      'Delay caffeine until 90-120 minutes after waking (allows natural cortisol peak)',
    ],
    durationMinutes: 20,
    tier: 'pro',
  },
  {
    id: 'sleep-consistency',
    title: 'Sleep Consistency Protocol',
    category: 'sleep',
    summary:
      'Sleep regularity (consistent bed/wake times) is a stronger predictor of cognitive performance and mood than total sleep duration.',
    citation:
      'Phillips et al. (2017). Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing. Scientific Reports, 7, 3216.',
    steps: [
      'Choose a fixed wake time and keep it within ±30 min, even on weekends',
      'Set a "wind-down alarm" 60 minutes before target bedtime',
      'During wind-down: dim lights, no screens, light reading or journaling',
      'Keep bedroom cool (65-68°F / 18-20°C) and dark',
      'Track your sleep/wake consistency in your habits (aim for 7/7 days)',
    ],
    durationMinutes: null,
    tier: 'pro',
  },
  {
    id: 'zone2-cardio',
    title: 'Zone 2 Cardio for Cognitive Performance',
    category: 'exercise',
    summary:
      'Low-intensity aerobic exercise (Zone 2) improves mitochondrial function and BDNF levels, directly enhancing learning, memory, and sustained attention.',
    citation:
      'Voss et al. (2013). Exercise and hippocampal memory systems. Trends in Cognitive Sciences, 23(4), 318-333.',
    steps: [
      'Aim for 150-180 minutes per week of Zone 2 cardio',
      'Zone 2 = you can hold a conversation but it feels slightly effortful',
      'Activities: brisk walking, easy cycling, light jogging, swimming',
      'Split into 3-5 sessions per week (30-45 min each)',
      'Track sessions with your focus timer — note cognitive performance after exercise days',
    ],
    durationMinutes: 35,
    tier: 'pro',
  },
  {
    id: 'caffeine-timing',
    title: 'Caffeine Timing Optimizer',
    category: 'nutrition',
    summary:
      'Caffeine has a half-life of ~5-6 hours. Timing intake to avoid competing with natural cortisol peaks and sleep pressure improves both alertness and sleep quality.',
    citation:
      'Drake et al. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. Journal of Clinical Sleep Medicine, 9(11), 1195-1200.',
    steps: [
      'Delay first caffeine to 90-120 min after waking (let cortisol peak naturally)',
      'Optimal window: 9:30-11:30 AM for most people',
      'Set a caffeine cutoff 8-10 hours before bedtime',
      'If bedtime is 10 PM, last caffeine by 12-2 PM',
      'Track energy levels on days you follow vs skip this protocol',
    ],
    durationMinutes: null,
    tier: 'free',
  },
  {
    id: 'chronotype-alignment',
    title: 'Chronotype-Aligned Work Scheduling',
    category: 'focus',
    summary:
      'Matching task type to your energy phase (Peak for analytical work, Dip for admin, Recovery for creative) leverages natural circadian variations in cognitive capacity.',
    citation:
      'Horne, J. A., & Östberg, O. (1976). A self-assessment questionnaire to determine morningness-eveningness in human circadian rhythms. International Journal of Chronobiology, 4, 97-110. Framework: Yousef, S. Becoming Superhuman, UC Berkeley Haas.',
    steps: [
      'Identify your chronotype (AM-Shifted, Bi-Phasic, or PM-Shifted)',
      'During your Peak phase: schedule deep analytical work — coding, writing, complex problem-solving',
      'During your Dip phase: handle email, meetings, administrative tasks, or take a 20-min nap',
      'During your Recovery phase: do creative work — brainstorming, design, lateral thinking',
      'Track sprint quality across phases to find your personal pattern',
    ],
    durationMinutes: null,
    tier: 'free',
  },
  {
    id: 'cold-exposure',
    title: 'Deliberate Cold Exposure for Focus',
    category: 'recovery',
    summary:
      'Brief cold exposure triggers a 250% increase in dopamine and 530% increase in norepinephrine — sustained for hours. This improves mood, energy, and focus without the crash of stimulants.',
    citation:
      'Srámek et al. (2000). Human physiological responses to immersion into water of different temperatures. European Journal of Applied Physiology, 81, 436-442. Protocol from: Huberman Lab (2022).',
    steps: [
      'Start with 30 seconds of cold water at the end of your shower',
      'Build up to 1-3 minutes over 2 weeks',
      'Target: 11 minutes total per week across 2-4 sessions',
      'Water should be uncomfortably cold but safe (50-60°F / 10-15°C)',
      'Track your mood and focus before and after each session',
    ],
    durationMinutes: 3,
    tier: 'free',
  },
];

export function getProtocolsByCategory(category: string): ScienceProtocol[] {
  return SCIENCE_PROTOCOLS.filter((p) => p.category === category);
}

export function getFreeProtocols(): ScienceProtocol[] {
  return SCIENCE_PROTOCOLS.filter((p) => p.tier === 'free');
}

export function getProProtocols(): ScienceProtocol[] {
  return SCIENCE_PROTOCOLS.filter((p) => p.tier === 'pro');
}
