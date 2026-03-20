import {
  getReflectionPrompt,
  formatGratitudeEntries,
  formatReflectionEntry,
  REFLECTION_PROMPTS,
} from '../lib/journal-prompts';

describe('getReflectionPrompt', () => {
  it('returns a valid prompt for any day', () => {
    for (let day = 0; day < 365; day++) {
      const prompt = getReflectionPrompt(day);
      expect(REFLECTION_PROMPTS).toContain(prompt);
    }
  });

  it('rotates through all prompts without repeating within the cycle length', () => {
    const seen = new Set<string>();
    for (let day = 0; day < REFLECTION_PROMPTS.length; day++) {
      const prompt = getReflectionPrompt(day);
      expect(seen.has(prompt)).toBe(false);
      seen.add(prompt);
    }
    expect(seen.size).toBe(REFLECTION_PROMPTS.length);
  });

  it('wraps around after exhausting all prompts', () => {
    const first = getReflectionPrompt(0);
    const wrapped = getReflectionPrompt(REFLECTION_PROMPTS.length);
    expect(wrapped).toBe(first);
  });
});

describe('formatGratitudeEntries', () => {
  it('formats filled entries with numbers', () => {
    const result = formatGratitudeEntries(['sunshine', 'coffee', 'a good friend']);
    expect(result).toBe('1. sunshine\n2. coffee\n3. a good friend');
  });

  it('filters out empty entries', () => {
    const result = formatGratitudeEntries(['sunshine', '', 'a friend']);
    expect(result).toBe('1. sunshine\n2. a friend');
  });

  it('trims whitespace', () => {
    const result = formatGratitudeEntries(['  sunshine  ', '  coffee  ']);
    expect(result).toBe('1. sunshine\n2. coffee');
  });

  it('returns empty string for all-empty input', () => {
    expect(formatGratitudeEntries(['', '', ''])).toBe('');
  });
});

describe('formatReflectionEntry', () => {
  it('prefixes content with the prompt', () => {
    const result = formatReflectionEntry('What was your win?', 'Shipped a feature!');
    expect(result).toBe('Q: What was your win?\n\nShipped a feature!');
  });

  it('trims response whitespace', () => {
    const result = formatReflectionEntry('Prompt', '  answer  ');
    expect(result).toBe('Q: Prompt\n\nanswer');
  });
});
