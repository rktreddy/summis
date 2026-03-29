import {
  computeEnergyWindows,
  getCurrentEnergyPhase,
  computeChronotypeProfile,
  getSprintAdvice,
  assessChronotype,
  CHRONOTYPE_DEFINITIONS,
} from '../lib/chronotype-engine';
import type { ChronotypeCategory } from '../types/summis';

describe('computeEnergyWindows', () => {
  it('returns 3 energy windows for AM-Shifted', () => {
    const windows = computeEnergyWindows('am_shifted', '06:00');
    expect(windows).toHaveLength(3);
    expect(windows.map((w) => w.phase)).toEqual(['peak', 'dip', 'recovery']);
  });

  it('returns 3 energy windows for Bi-Phasic', () => {
    const windows = computeEnergyWindows('bi_phasic', '07:00');
    expect(windows).toHaveLength(3);
    expect(windows[0].phase).toBe('peak');
    expect(windows[1].phase).toBe('dip');
    expect(windows[2].phase).toBe('recovery');
  });

  it('PM-Shifted starts with dip (morning sluggishness)', () => {
    const windows = computeEnergyWindows('pm_shifted', '08:30');
    expect(windows[0].phase).toBe('dip');
    expect(windows[1].phase).toBe('peak');
    expect(windows[2].phase).toBe('recovery');
  });

  it('AM-Shifted peak starts shortly after waking', () => {
    const windows = computeEnergyWindows('am_shifted', '06:00');
    const peak = windows.find((w) => w.phase === 'peak')!;
    expect(peak.startTime).toBe('06:30');
    expect(peak.endTime).toBe('11:00');
  });

  it('Bi-Phasic peak starts 2h after waking', () => {
    const windows = computeEnergyWindows('bi_phasic', '07:00');
    const peak = windows.find((w) => w.phase === 'peak')!;
    expect(peak.startTime).toBe('09:00');
    expect(peak.endTime).toBe('13:00');
  });

  it('PM-Shifted peak starts 3.5h after waking', () => {
    const windows = computeEnergyWindows('pm_shifted', '08:30');
    const peak = windows.find((w) => w.phase === 'peak')!;
    expect(peak.startTime).toBe('12:00');
  });

  it('handles different wake times for same chronotype', () => {
    const early = computeEnergyWindows('bi_phasic', '06:00');
    const late = computeEnergyWindows('bi_phasic', '08:00');
    // Peak should shift by 2 hours
    expect(early.find((w) => w.phase === 'peak')!.startTime).toBe('08:00');
    expect(late.find((w) => w.phase === 'peak')!.startTime).toBe('10:00');
  });
});

describe('getCurrentEnergyPhase', () => {
  it('returns peak phase during peak window', () => {
    // Bi-phasic, wake at 7, peak is 9-13
    const now = new Date();
    now.setHours(10, 0, 0, 0); // 10 AM — in peak
    const result = getCurrentEnergyPhase('bi_phasic', '07:00', now);
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('peak');
    expect(result!.minutesRemaining).toBeGreaterThan(0);
  });

  it('returns dip phase during dip window', () => {
    const now = new Date();
    now.setHours(14, 0, 0, 0); // 2 PM — in dip for bi_phasic (13-16)
    const result = getCurrentEnergyPhase('bi_phasic', '07:00', now);
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('dip');
  });

  it('returns null outside all windows', () => {
    const now = new Date();
    now.setHours(23, 0, 0, 0); // 11 PM — outside all windows
    const result = getCurrentEnergyPhase('bi_phasic', '07:00', now);
    expect(result).toBeNull();
  });

  it('AM-Shifted peak detected in early morning', () => {
    const now = new Date();
    now.setHours(8, 0, 0, 0); // 8 AM — in peak for AM-Shifted (6:30-11)
    const result = getCurrentEnergyPhase('am_shifted', '06:00', now);
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('peak');
  });

  it('PM-Shifted shows dip in morning', () => {
    const now = new Date();
    now.setHours(9, 0, 0, 0); // 9 AM — dip for PM-shifted (8:30-12)
    const result = getCurrentEnergyPhase('pm_shifted', '08:30', now);
    expect(result).not.toBeNull();
    expect(result!.phase).toBe('dip');
  });
});

describe('computeChronotypeProfile', () => {
  it('returns caffeine timing for bi-phasic', () => {
    const profile = computeChronotypeProfile('bi_phasic', '07:00');
    expect(profile.caffeineEarliest).toBe('08:30'); // 90 min after wake
    expect(profile.caffeineCutoff).toBe('15:00'); // 8h before 23:00 sleep
  });

  it('returns caffeine timing for AM-shifted', () => {
    const profile = computeChronotypeProfile('am_shifted', '06:00');
    expect(profile.caffeineEarliest).toBe('07:30'); // 90 min after wake
    expect(profile.caffeineCutoff).toBe('14:00'); // 8h before 22:00 sleep
  });

  it('returns nap window during dip phase', () => {
    const profile = computeChronotypeProfile('bi_phasic', '07:00');
    expect(profile.napWindow).not.toBeNull();
    expect(profile.napWindow!.maxMinutes).toBe(20);
  });

  it('peak window start/end match energy windows', () => {
    const profile = computeChronotypeProfile('bi_phasic', '07:00');
    expect(profile.peakWindowStart).toBe('09:00');
    expect(profile.peakWindowEnd).toBe('13:00');
  });
});

describe('getSprintAdvice', () => {
  it('returns peak advice during peak window', () => {
    const now = new Date();
    now.setHours(10, 0, 0, 0);
    const advice = getSprintAdvice('bi_phasic', '07:00', now);
    expect(advice).toContain('Peak');
  });

  it('returns dip advice during dip window', () => {
    const now = new Date();
    now.setHours(14, 0, 0, 0);
    const advice = getSprintAdvice('bi_phasic', '07:00', now);
    expect(advice).toContain('Dip');
  });

  it('returns rest message outside windows', () => {
    const now = new Date();
    now.setHours(23, 0, 0, 0);
    const advice = getSprintAdvice('bi_phasic', '07:00', now);
    expect(advice).toContain('Rest');
  });
});

describe('assessChronotype', () => {
  it('returns bi_phasic for majority bi_phasic answers', () => {
    const result = assessChronotype(['bi_phasic', 'bi_phasic', 'am_shifted']);
    expect(result).toBe('bi_phasic');
  });

  it('returns am_shifted for majority am_shifted answers', () => {
    const result = assessChronotype(['am_shifted', 'am_shifted', 'pm_shifted']);
    expect(result).toBe('am_shifted');
  });

  it('returns bi_phasic on tie', () => {
    const result = assessChronotype(['am_shifted', 'bi_phasic', 'pm_shifted']);
    expect(result).toBe('bi_phasic');
  });
});

describe('CHRONOTYPE_DEFINITIONS', () => {
  it('has 3 chronotype definitions', () => {
    expect(CHRONOTYPE_DEFINITIONS).toHaveLength(3);
  });

  it('covers all three categories', () => {
    const keys = CHRONOTYPE_DEFINITIONS.map((d) => d.key);
    expect(keys).toContain('am_shifted');
    expect(keys).toContain('bi_phasic');
    expect(keys).toContain('pm_shifted');
  });

  it('each definition has required fields', () => {
    for (const def of CHRONOTYPE_DEFINITIONS) {
      expect(def.label).toBeTruthy();
      expect(def.population).toBeTruthy();
      expect(def.description).toBeTruthy();
      expect(def.wakeTimeDefault).toMatch(/^\d{2}:\d{2}$/);
      expect(def.sleepTimeDefault).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
