import * as Notifications from 'expo-notifications';
import { computeEnergyWindows, ENERGY_PHASE_INFO } from '@/lib/chronotype-engine';
import type { ChronotypeCategory } from '@/types/summis';

/**
 * Schedule energy-phase-based notifications.
 * Replaces the old ultradian rhythm notifications with chronotype-aware alerts.
 * Notifies 10 minutes before each energy phase transition.
 */
export async function scheduleEnergyPhaseNotifications(
  chronotype: ChronotypeCategory,
  wakeTime: string
): Promise<void> {
  // Cancel existing peak performance notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'peak_performance' || n.content.data?.type === 'energy_phase') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const windows = computeEnergyWindows(chronotype, wakeTime);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  let notificationCount = 0;

  for (const window of windows) {
    // Max 2 notifications per day
    if (notificationCount >= 2) break;

    const [h, m] = window.startTime.split(':').map(Number);
    const phaseStart = new Date(`${today}T${window.startTime}:00`);

    // Notify 10 min before phase starts
    const notifyTime = new Date(phaseStart.getTime() - 10 * 60 * 1000);

    // Only schedule future notifications
    if (notifyTime <= now) continue;

    const info = ENERGY_PHASE_INFO[window.phase];

    let body: string;
    switch (window.phase) {
      case 'peak':
        body = `Your Peak focus window opens at ${window.startTime}. Prepare for deep, analytical work.`;
        break;
      case 'dip':
        body = `Energy dip starting at ${window.startTime}. Good time for admin tasks or a short break.`;
        break;
      case 'recovery':
        body = `Recovery window at ${window.startTime}. Great for creative work and brainstorming.`;
        break;
      default:
        body = `Your ${info.label} phase starts at ${window.startTime}.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Summis \u2014 ${info.label} Phase`,
        body,
        data: { type: 'energy_phase', phase: window.phase },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyTime,
      },
    });

    notificationCount++;
  }
}

/**
 * Schedule ultradian rhythm notifications based on the user's wake time.
 * @deprecated Use scheduleEnergyPhaseNotifications instead for chronotype-aware alerts.
 */
export async function scheduleUltradianNotifications(
  wakeTime: Date
): Promise<void> {
  // Legacy function — delegates to new energy phase notifications
  // Defaults to bi_phasic if called without chronotype info
  const wakeTimeStr = `${String(wakeTime.getHours()).padStart(2, '0')}:${String(wakeTime.getMinutes()).padStart(2, '0')}`;
  await scheduleEnergyPhaseNotifications('bi_phasic', wakeTimeStr);
}

/**
 * Schedule a morning priming reminder.
 * Fires at the user's configured wake time.
 */
export async function scheduleMorningPrime(wakeTime: Date): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'morning_prime') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const now = new Date();
  const trigger = new Date(wakeTime);

  // If wake time has passed today, schedule for tomorrow
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Summis \u2014 Morning Protocol',
      body: 'Good morning! Set your 3 MITs for today and prepare your focus environment.',
      data: { type: 'morning_prime' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}
