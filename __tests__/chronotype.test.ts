import {
  computeDailySchedule,
  getCurrentWindow,
  getNextPeakIn,
  parseTimeToday,
} from '../lib/chronotype';

describe('computeDailySchedule', () => {
  it('computes correct peaks for moderate chronotype at 7:00 AM', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    // First peak: 7:00 + 2.5h = 9:30
    expect(schedule.firstPeak.start.getHours()).toBe(9);
    expect(schedule.firstPeak.start.getMinutes()).toBe(30);
    // First peak end: 9:30 + 90min = 11:00
    expect(schedule.firstPeak.end.getHours()).toBe(11);
    expect(schedule.firstPeak.end.getMinutes()).toBe(0);
    // Second peak: 7:00 + 6h = 13:00
    expect(schedule.secondPeak.start.getHours()).toBe(13);
    expect(schedule.secondPeak.start.getMinutes()).toBe(0);
  });

  it('shifts peaks earlier for early chronotype', () => {
    const schedule = computeDailySchedule('07:00', 'early');
    // First peak: 7:00 + 2.5h - 30min = 9:00
    expect(schedule.firstPeak.start.getHours()).toBe(9);
    expect(schedule.firstPeak.start.getMinutes()).toBe(0);
  });

  it('shifts peaks later for late chronotype', () => {
    const schedule = computeDailySchedule('07:00', 'late');
    // First peak: 7:00 + 2.5h + 30min = 10:00
    expect(schedule.firstPeak.start.getHours()).toBe(10);
    expect(schedule.firstPeak.start.getMinutes()).toBe(0);
  });

  it('computes bedtime as wake + 16h', () => {
    const schedule = computeDailySchedule('06:00', 'moderate');
    expect(schedule.bedTime.getHours()).toBe(22); // 6 AM + 16h = 10 PM
  });

  it('computes caffeine cutoff as bedtime - 8h', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    // Bed = 23:00, cutoff = 15:00
    expect(schedule.caffeineCutoff.getHours()).toBe(15);
  });

  it('computes wind-down as bedtime - 1h', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    // Bed = 23:00, wind-down = 22:00
    expect(schedule.windDownStart.getHours()).toBe(22);
  });

  it('handles early riser (4 AM)', () => {
    const schedule = computeDailySchedule('04:00', 'early');
    expect(schedule.firstPeak.start.getHours()).toBe(6);
    expect(schedule.bedTime.getHours()).toBe(20);
  });

  it('handles late riser (11 AM)', () => {
    const schedule = computeDailySchedule('11:00', 'late');
    // 11:00 + 2.5h + 30min = 14:00
    expect(schedule.firstPeak.start.getHours()).toBe(14);
  });
});

describe('getCurrentWindow', () => {
  it('returns peak1 during first peak', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const duringPeak1 = new Date(schedule.firstPeak.start);
    duringPeak1.setMinutes(duringPeak1.getMinutes() + 30);
    expect(getCurrentWindow(schedule, duringPeak1)).toBe('peak1');
  });

  it('returns peak2 during second peak', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const duringPeak2 = new Date(schedule.secondPeak.start);
    duringPeak2.setMinutes(duringPeak2.getMinutes() + 10);
    expect(getCurrentWindow(schedule, duringPeak2)).toBe('peak2');
  });

  it('returns recovery between peaks', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const betweenPeaks = new Date(schedule.firstPeak.end);
    betweenPeaks.setMinutes(betweenPeaks.getMinutes() + 30);
    expect(getCurrentWindow(schedule, betweenPeaks)).toBe('recovery');
  });

  it('returns wind-down near bedtime', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const windDown = new Date(schedule.windDownStart);
    windDown.setMinutes(windDown.getMinutes() + 15);
    expect(getCurrentWindow(schedule, windDown)).toBe('wind-down');
  });
});

describe('getNextPeakIn', () => {
  it('returns 0 during a peak', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const duringPeak = new Date(schedule.firstPeak.start);
    duringPeak.setMinutes(duringPeak.getMinutes() + 10);
    expect(getNextPeakIn(schedule, duringPeak)).toBe(0);
  });

  it('returns minutes until first peak when before it', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const beforePeak = new Date(schedule.wakeTime);
    beforePeak.setMinutes(beforePeak.getMinutes() + 30); // 7:30
    const minutes = getNextPeakIn(schedule, beforePeak);
    expect(minutes).toBe(120); // 9:30 - 7:30 = 120 min
  });

  it('returns minutes until second peak when between peaks', () => {
    const schedule = computeDailySchedule('07:00', 'moderate');
    const betweenPeaks = new Date(schedule.firstPeak.end); // 11:00
    const minutes = getNextPeakIn(schedule, betweenPeaks);
    expect(minutes).toBe(120); // 13:00 - 11:00 = 120 min
  });
});
