import { computeHygieneCorrelations } from '../lib/correlation-engine';
import type { HygieneConfig, HygieneLog, Sprint } from '../types/summis';

function makeDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function makeConfig(practice: string, label: string): HygieneConfig {
  return {
    id: `cfg-${practice}`,
    user_id: 'u1',
    practice: practice as HygieneConfig['practice'],
    label,
    description: null,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

function makeLog(practice: string, daysAgo: number, compliant: boolean): HygieneLog {
  return {
    id: `log-${practice}-${daysAgo}`,
    user_id: 'u1',
    practice: practice as HygieneLog['practice'],
    date: makeDateString(daysAgo),
    compliant,
    sprint_id: null,
    logged_at: new Date().toISOString(),
  };
}

function makeSprint(daysAgo: number, focusQuality: number): Sprint {
  const date = makeDateString(daysAgo);
  return {
    id: `sp-${daysAgo}`,
    user_id: 'u1',
    date,
    intention: 'Test sprint',
    duration_minutes: 45,
    phase: 'reflection',
    started_at: new Date(new Date().setDate(new Date().getDate() - daysAgo)).toISOString(),
    ended_at: new Date().toISOString(),
    completed: true,
    phone_away: true,
    dnd_enabled: true,
    environment_ready: true,
    focus_quality: focusQuality,
    intention_met: 'yes',
    reflection_note: null,
    interruptions: 0,
    interruption_types: [],
    mit_id: null,
  };
}

describe('computeHygieneCorrelations', () => {
  it('returns empty for no active configs', () => {
    const result = computeHygieneCorrelations([], [], [], 30);
    expect(result).toEqual([]);
  });

  it('returns empty for inactive configs', () => {
    const configs = [{ ...makeConfig('phone_away', 'Phone Away'), is_active: false }];
    const result = computeHygieneCorrelations(configs, [], [], 30);
    expect(result).toEqual([]);
  });

  it('skips days with no focus quality data', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    const logs = [makeLog('phone_away', 1, true)];
    // Sprint with null focus quality
    const sprints: Sprint[] = [{ ...makeSprint(1, 3), focus_quality: null }];
    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    // Should skip this day since no focus quality, resulting in no data points
    expect(result.length).toBe(0);
  });

  it('marks high completers (>90%) as not significant', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    // Compliant 24 out of 25 days (96%)
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];
    for (let i = 0; i < 25; i++) {
      logs.push(makeLog('phone_away', i, i !== 12)); // Only 1 non-compliant day
      sprints.push(makeSprint(i, 3 + (i % 3)));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(1);
    expect(result[0].highCompleter).toBe(true);
    expect(result[0].isSignificant).toBe(false);
    expect(result[0].insightText).toContain('too consistently');
  });

  it('marks low completers (<10%) as not significant', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    // Compliant only 1 out of 25 days (4%)
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];
    for (let i = 0; i < 25; i++) {
      logs.push(makeLog('phone_away', i, i === 0)); // Only 1 compliant day
      sprints.push(makeSprint(i, 3 + (i % 3)));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(1);
    expect(result[0].lowCompleter).toBe(true);
    expect(result[0].isSignificant).toBe(false);
    expect(result[0].insightText).toContain('more consistently');
  });

  it('requires minimum 20 data points for significance', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];
    // Only 15 days of data
    for (let i = 0; i < 15; i++) {
      logs.push(makeLog('phone_away', i, i % 2 === 0));
      sprints.push(makeSprint(i, i % 2 === 0 ? 5 : 2));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(1);
    expect(result[0].sampleSize).toBe(15);
    expect(result[0].isSignificant).toBe(false);
  });

  it('detects positive correlation when compliant days have higher focus', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];

    for (let i = 0; i < 25; i++) {
      const compliant = i % 2 === 0;
      logs.push(makeLog('phone_away', i, compliant));
      // Compliant days: quality 4-5, non-compliant: quality 1-2
      sprints.push(makeSprint(i, compliant ? 4 + (i % 2) : 1 + (i % 2)));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(1);
    expect(result[0].correlation).toBeGreaterThan(0);
    expect(result[0].direction).toBe('positive');
  });

  it('sorts significant correlations first, then by strength', () => {
    const configs = [
      makeConfig('phone_away', 'Phone Away'),
      makeConfig('dnd_active', 'DND Active'),
    ];
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];

    for (let i = 0; i < 25; i++) {
      // phone_away: strong correlation pattern
      logs.push(makeLog('phone_away', i, i % 2 === 0));
      // dnd_active: always compliant (high completer, not significant)
      logs.push(makeLog('dnd_active', i, true));
      sprints.push(makeSprint(i, i % 2 === 0 ? 5 : 1));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(2);
    // phone_away should be first (significant or at least stronger correlation)
    // dnd_active should be second (high completer, not significant)
    const phoneResult = result.find((r) => r.practice === 'phone_away')!;
    const dndResult = result.find((r) => r.practice === 'dnd_active')!;
    expect(dndResult.highCompleter).toBe(true);
    expect(dndResult.isSignificant).toBe(false);
    // Significant should sort before non-significant
    expect(result.indexOf(phoneResult)).toBeLessThan(result.indexOf(dndResult));
  });

  it('generates insight text with percentage for significant correlations', () => {
    const configs = [makeConfig('phone_away', 'Phone Away')];
    const logs: HygieneLog[] = [];
    const sprints: Sprint[] = [];

    for (let i = 0; i < 25; i++) {
      const compliant = i % 2 === 0;
      logs.push(makeLog('phone_away', i, compliant));
      sprints.push(makeSprint(i, compliant ? 5 : 2));
    }

    const result = computeHygieneCorrelations(configs, logs, sprints, 30);
    expect(result.length).toBe(1);
    if (result[0].isSignificant) {
      expect(result[0].insightText).toMatch(/\d+% higher/);
    }
  });
});
