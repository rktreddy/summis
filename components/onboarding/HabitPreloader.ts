import type { Habit, UserGoal } from '@/types';

type PresetHabit = Pick<Habit, 'title' | 'description' | 'category' | 'science_note' | 'difficulty'>;

const FOCUS_HABITS: PresetHabit[] = [
  {
    title: 'Deep Work Block (90 min)',
    description: '90-minute focused session on your most important task',
    category: 'focus',
    science_note: 'Ultradian rhythm research by Peretz Lavie (1985)',
    difficulty: 'hard',
  },
  {
    title: 'No Phone Before 10am',
    description: 'Avoid phone for the first hours after waking',
    category: 'focus',
    science_note: 'Reduces reactive attention and preserves morning focus window',
    difficulty: 'easy',
  },
  {
    title: 'Daily Planning (10 min)',
    description: 'Plan your top 3 priorities for the day',
    category: 'focus',
    science_note: 'Implementation intentions increase goal completion (Gollwitzer, 1999)',
    difficulty: 'moderate',
  },
];

const SLEEP_HABITS: PresetHabit[] = [
  {
    title: '10:30pm Wind-Down',
    description: 'Begin your wind-down routine by 10:30pm',
    category: 'sleep',
    science_note: 'Consistent pre-sleep routines improve sleep onset latency',
    difficulty: 'moderate',
  },
  {
    title: 'No Screens 1hr Before Bed',
    description: 'Avoid screens at least 60 minutes before sleep',
    category: 'sleep',
    science_note: 'Blue light suppresses melatonin production (Chang et al., 2015)',
    difficulty: 'moderate',
  },
  {
    title: 'Consistent Wake Time',
    description: 'Wake up within 30 minutes of the same time daily',
    category: 'sleep',
    science_note: 'Sleep consistency is more predictive of health than duration (Phillips et al., 2017)',
    difficulty: 'easy',
  },
];

const FITNESS_HABITS: PresetHabit[] = [
  {
    title: 'Morning Movement (20 min)',
    description: '20 minutes of light exercise or stretching',
    category: 'exercise',
    science_note: 'Morning exercise improves executive function for 2+ hours (Basso & Suzuki, 2017)',
    difficulty: 'moderate',
  },
  {
    title: 'Zone 2 Cardio (30 min)',
    description: 'Conversational-pace cardio — jog, bike, or swim',
    category: 'exercise',
    science_note: 'Increases BDNF and hippocampal volume (Voss et al., 2013)',
    difficulty: 'hard',
  },
  {
    title: 'Evening Walk',
    description: '15-20 minute walk after dinner',
    category: 'exercise',
    science_note: 'Post-meal walking improves glucose regulation (Colberg et al., 2016)',
    difficulty: 'easy',
  },
];

const GENERAL_HABITS: PresetHabit[] = [
  {
    title: 'Morning Journal',
    description: 'Write 3-5 sentences about intentions or gratitude',
    category: 'mindfulness',
    science_note: 'Expressive writing reduces stress and improves working memory (Klein & Boals, 2001)',
    difficulty: 'moderate',
  },
  {
    title: 'Hydration (8 glasses)',
    description: 'Track daily water intake — aim for 8 glasses',
    category: 'nutrition',
    science_note: 'Even mild dehydration impairs cognitive performance (Ganio et al., 2011)',
    difficulty: 'easy',
  },
  {
    title: 'Gratitude Practice',
    description: 'Write down 3 things you are grateful for',
    category: 'mindfulness',
    science_note: 'Gratitude journaling increases well-being and sleep quality (Emmons & McCullough, 2003)',
    difficulty: 'easy',
  },
];

const PRESETS: Record<UserGoal, PresetHabit[]> = {
  focus: FOCUS_HABITS,
  sleep: SLEEP_HABITS,
  fitness: FITNESS_HABITS,
  general: GENERAL_HABITS,
};

export function getPresetsForGoal(goal: UserGoal): PresetHabit[] {
  return PRESETS[goal];
}
