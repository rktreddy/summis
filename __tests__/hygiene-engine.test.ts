import {
  computeHygieneScore,
  getDefaultHygieneConfigs,
  getPreSprintChecklist,
  HYGIENE_PRACTICES,
  FREE_PRACTICES,
  PRO_PRACTICES,
} from '@/lib/hygiene-engine';
import type { HygieneConfig, HygieneLog } from '@/types/summis';

function makeConfig(practice: string, isActive = true): HygieneConfig {
  return {
    id: `cfg-${practice}`,
    user_id: 'user-1',
    practice: practice as HygieneConfig['practice'],
    label: practice,
    description: null,
    is_active: isActive,
    created_at: '2026-01-01',
  };
}

function makeLog(practice: string, date: string, compliant: boolean): HygieneLog {
  return {
    id: `log-${practice}-${date}`,
    user_id: 'user-1',
    practice: practice as HygieneLog['practice'],
    date,
    compliant,
    sprint_id: null,
    logged_at: `${date}T12:00:00Z`,
  };
}

describe('Hygiene Engine', () => {
  describe('computeHygieneScore', () => {
    it('returns 0 when no active configs', () => {
      expect(computeHygieneScore([], [], '2026-03-28')).toBe(0);
    });

    it('returns 0 when no logs for the date', () => {
      const configs = [makeConfig('phone_away')];
      expect(computeHygieneScore(configs, [], '2026-03-28')).toBe(0);
    });

    it('returns 100 when all practices are compliant', () => {
      const configs = [
        makeConfig('phone_away'),
        makeConfig('dnd_active'),
      ];
      const logs = [
        makeLog('phone_away', '2026-03-28', true),
        makeLog('dnd_active', '2026-03-28', true),
      ];
      expect(computeHygieneScore(configs, logs, '2026-03-28')).toBe(100);
    });

    it('returns 50 when half are compliant', () => {
      const configs = [
        makeConfig('phone_away'),
        makeConfig('dnd_active'),
      ];
      const logs = [
        makeLog('phone_away', '2026-03-28', true),
        makeLog('dnd_active', '2026-03-28', false),
      ];
      expect(computeHygieneScore(configs, logs, '2026-03-28')).toBe(50);
    });

    it('ignores inactive configs', () => {
      const configs = [
        makeConfig('phone_away', true),
        makeConfig('dnd_active', false),
      ];
      const logs = [
        makeLog('phone_away', '2026-03-28', true),
      ];
      expect(computeHygieneScore(configs, logs, '2026-03-28')).toBe(100);
    });

    it('ignores logs from other dates', () => {
      const configs = [makeConfig('phone_away')];
      const logs = [
        makeLog('phone_away', '2026-03-27', true), // yesterday
      ];
      expect(computeHygieneScore(configs, logs, '2026-03-28')).toBe(0);
    });

    it('rounds to nearest integer', () => {
      const configs = [
        makeConfig('phone_away'),
        makeConfig('dnd_active'),
        makeConfig('environment_clear'),
      ];
      const logs = [
        makeLog('phone_away', '2026-03-28', true),
        makeLog('dnd_active', '2026-03-28', false),
        makeLog('environment_clear', '2026-03-28', false),
      ];
      expect(computeHygieneScore(configs, logs, '2026-03-28')).toBe(33); // 1/3 = 33.33 → 33
    });
  });

  describe('getDefaultHygieneConfigs', () => {
    it('returns 3 default configs for free tier', () => {
      const configs = getDefaultHygieneConfigs('user-1');
      expect(configs).toHaveLength(3);
    });

    it('all defaults are active', () => {
      const configs = getDefaultHygieneConfigs('user-1');
      expect(configs.every((c) => c.is_active)).toBe(true);
    });

    it('sets the correct user_id', () => {
      const configs = getDefaultHygieneConfigs('user-xyz');
      expect(configs.every((c) => c.user_id === 'user-xyz')).toBe(true);
    });

    it('includes phone_away, notifications_off, dnd_active', () => {
      const configs = getDefaultHygieneConfigs('user-1');
      const practices = configs.map((c) => c.practice);
      expect(practices).toContain('phone_away');
      expect(practices).toContain('notifications_off');
      expect(practices).toContain('dnd_active');
    });
  });

  describe('getPreSprintChecklist', () => {
    it('returns only active configs', () => {
      const configs = [
        makeConfig('phone_away', true),
        makeConfig('dnd_active', false),
        makeConfig('environment_clear', true),
      ];
      const checklist = getPreSprintChecklist(configs);
      expect(checklist).toHaveLength(2);
      expect(checklist.map((c) => c.practice)).toEqual(['phone_away', 'environment_clear']);
    });

    it('returns empty array when no active configs', () => {
      const configs = [makeConfig('phone_away', false)];
      expect(getPreSprintChecklist(configs)).toEqual([]);
    });
  });

  describe('practice definitions', () => {
    it('has 7 total practices', () => {
      expect(HYGIENE_PRACTICES).toHaveLength(7);
    });

    it('has 3 free defaults', () => {
      expect(FREE_PRACTICES).toHaveLength(3);
    });

    it('has 4 pro practices', () => {
      expect(PRO_PRACTICES).toHaveLength(4);
    });

    it('all practices have required fields', () => {
      for (const p of HYGIENE_PRACTICES) {
        expect(p.practice).toBeTruthy();
        expect(p.label).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.scienceNote).toBeTruthy();
        expect(typeof p.isFreeDefault).toBe('boolean');
      }
    });
  });
});
