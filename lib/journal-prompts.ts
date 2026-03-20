export type JournalMode = 'free' | 'gratitude' | 'reflection';

export const JOURNAL_MODES: { key: JournalMode; label: string; icon: string }[] = [
  { key: 'free', label: 'Free Write', icon: '\u270D\uFE0F' },
  { key: 'gratitude', label: 'Gratitude', icon: '\uD83D\uDE4F' },
  { key: 'reflection', label: 'Reflection', icon: '\uD83D\uDCAD' },
];

export const REFLECTION_PROMPTS = [
  'What was your biggest win today?',
  'What would you do differently about today?',
  'What did you learn that surprised you?',
  'What are you looking forward to tomorrow?',
  'Which habit had the most impact today and why?',
  'Where did you waste time today? What triggered it?',
  'What are you avoiding right now? Why?',
  'What would make tomorrow a 10/10 day?',
  'Who helped you today? How can you pay it forward?',
  'What are you most proud of this week?',
  'What pattern do you notice in your energy levels?',
  'If you could only keep 3 habits, which would they be?',
];

export function getReflectionPrompt(dayOfYear?: number): string {
  const day = dayOfYear ?? Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return REFLECTION_PROMPTS[day % REFLECTION_PROMPTS.length];
}

export function formatGratitudeEntries(items: string[]): string {
  return items
    .filter((item) => item.trim())
    .map((item, i) => `${i + 1}. ${item.trim()}`)
    .join('\n');
}

export function formatReflectionEntry(prompt: string, response: string): string {
  return `Q: ${prompt}\n\n${response.trim()}`;
}
