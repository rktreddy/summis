// OneSignal push notification integration
// Requires: react-native-onesignal
//   npm install react-native-onesignal

import { Platform } from 'react-native';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? '';

export async function initOneSignal(userId?: string): Promise<void> {
  if (!ONESIGNAL_APP_ID) {
    console.warn('OneSignal: EXPO_PUBLIC_ONESIGNAL_APP_ID not set, skipping init');
    return;
  }
  // TODO: Uncomment when react-native-onesignal is installed
  // const OneSignal = (await import('react-native-onesignal')).default;
  // OneSignal.initialize(ONESIGNAL_APP_ID);
  // OneSignal.Notifications.requestPermission(true);
  // if (userId) OneSignal.login(userId);
  console.log('OneSignal: Initialized (stub) for platform:', Platform.OS);
}

export async function setUserTags(tags: Record<string, string | number>): Promise<void> {
  if (!ONESIGNAL_APP_ID) return;
  // TODO: Uncomment when react-native-onesignal is installed
  // const OneSignal = (await import('react-native-onesignal')).default;
  // OneSignal.User.addTags(tags);
  console.log('OneSignal: Tags set (stub):', tags);
}

export async function logoutOneSignal(): Promise<void> {
  if (!ONESIGNAL_APP_ID) return;
  // TODO: Uncomment when react-native-onesignal is installed
  // const OneSignal = (await import('react-native-onesignal')).default;
  // OneSignal.logout();
  console.log('OneSignal: Logged out (stub)');
}
