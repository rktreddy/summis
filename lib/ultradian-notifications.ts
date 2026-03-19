import * as Notifications from 'expo-notifications';
import { getAlertnessPeak, getNextPeakWindow } from '@/lib/science';

/**
 * Schedule ultradian rhythm notifications based on the user's wake time.
 * Notifies 20 minutes before peak performance windows.
 */
export async function scheduleUltradianNotifications(
  wakeTime: Date
): Promise<void> {
  // Cancel existing ultradian notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'peak_performance') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // First peak: ~2.5 hours after waking
  const firstPeak = getNextPeakWindow(wakeTime);
  const alertness = getAlertnessPeak(wakeTime);

  // Schedule notification 20 minutes before the peak
  const peaks = [
    { time: firstPeak, label: 'first' },
    {
      time: new Date(firstPeak.getTime() + 90 * 60 * 1000 + 20 * 60 * 1000),
      label: 'second',
    }, // ~110 min after first peak (90 min work + 20 min break)
    {
      time: new Date(firstPeak.getTime() + 2 * (90 * 60 * 1000 + 20 * 60 * 1000)),
      label: 'third',
    },
  ];

  const now = new Date();

  for (const peak of peaks) {
    const notifyTime = new Date(peak.time.getTime() - 20 * 60 * 1000);

    // Only schedule future notifications
    if (notifyTime <= now) continue;

    // Max 2 notifications per day (per CLAUDE.md rule)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '1000x \u2014 Peak Performance Window',
        body: `Your ${peak.label} focus window opens in 20 minutes. Prepare for a ${alertness.window}-minute deep work block.`,
        data: { type: 'peak_performance' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyTime,
      },
    });
  }
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
      title: '1000x \u2014 Morning Protocol',
      body: 'Good morning! Your science-backed morning protocol is ready. Start with sunlight, breathwork, and set your intentions.',
      data: { type: 'morning_prime' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}
