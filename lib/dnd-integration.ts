// ── DND Integration ───────────────────────────────────────────────────
// Integrates with iOS Focus mode and Android Do Not Disturb to automatically
// silence the device when a focus sprint starts, and restore when it ends.
//
// ACTIVATION STEPS:
// 1. Install: npx expo install expo-intent-launcher (Android DND settings)
// 2. For iOS Focus API: requires native module (expo-modules-core custom module)
//    - iOS 15+ Focus API is not yet exposed by Expo — requires custom native module
//    - Alternative: Shortcuts automation (user-configured, no native module needed)
// 3. Uncomment the implementation blocks below
//
// Note: Full DND control requires special permissions:
// - Android: ACCESS_NOTIFICATION_POLICY permission
// - iOS: Focus API requires user authorization per Focus profile

import { Platform } from 'react-native';

export interface DNDState {
  isActive: boolean;
  canControl: boolean;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Check if DND/Focus mode is currently active.
 * Returns the current state without changing anything.
 */
export async function getDNDState(): Promise<DNDState> {
  // TODO: Implement native module check
  // iOS: Check Focus API status
  // Android: Check NotificationManager.getCurrentInterruptionFilter()
  return {
    isActive: false,
    canControl: false,
    platform: Platform.OS as DNDState['platform'],
  };
}

/**
 * Check if the app has permission to control DND.
 */
export async function hasDNDPermission(): Promise<boolean> {
  // TODO: Implement permission check
  // Android: NotificationManager.isNotificationPolicyAccessGranted()
  // iOS: Focus API authorization status
  return false;
}

/**
 * Request permission to control DND.
 * On Android, opens the DND access settings screen.
 * On iOS, guides user to set up a Shortcuts automation.
 */
export async function requestDNDPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // TODO: Uncomment when expo-intent-launcher is installed
    // import * as IntentLauncher from 'expo-intent-launcher';
    // await IntentLauncher.startActivityAsync(
    //   IntentLauncher.ActivityAction.NOTIFICATION_POLICY_ACCESS_SETTINGS
    // );
    console.log('[DND] Would open Android DND permission settings');
    return false;
  }

  if (Platform.OS === 'ios') {
    // iOS does not allow programmatic DND control without a custom native module.
    // The recommended approach is to guide users to create a Shortcuts automation:
    // "When [Summis app] opens → Turn on [Focus mode]"
    console.log('[DND] iOS Focus mode requires Shortcuts automation setup');
    return false;
  }

  return false;
}

/**
 * Enable DND/Focus mode. Call this when a sprint starts.
 * Returns true if DND was successfully enabled.
 */
export async function enableDND(): Promise<boolean> {
  const hasPermission = await hasDNDPermission();
  if (!hasPermission) {
    console.log('[DND] No permission to control DND');
    return false;
  }

  if (Platform.OS === 'android') {
    // TODO: Uncomment when native module is available
    // import { NativeModules } from 'react-native';
    // const { DNDModule } = NativeModules;
    // await DNDModule.enableDND();
    console.log('[DND] Would enable Android DND');
    return false;
  }

  if (Platform.OS === 'ios') {
    // TODO: Implement via custom native module or Shortcuts trigger
    console.log('[DND] Would enable iOS Focus mode');
    return false;
  }

  return false;
}

/**
 * Disable DND/Focus mode. Call this when a sprint ends or is cancelled.
 * Returns true if DND was successfully disabled.
 */
export async function disableDND(): Promise<boolean> {
  const hasPermission = await hasDNDPermission();
  if (!hasPermission) {
    console.log('[DND] No permission to control DND');
    return false;
  }

  if (Platform.OS === 'android') {
    // TODO: Uncomment when native module is available
    // import { NativeModules } from 'react-native';
    // const { DNDModule } = NativeModules;
    // await DNDModule.disableDND();
    console.log('[DND] Would disable Android DND');
    return false;
  }

  if (Platform.OS === 'ios') {
    // TODO: Implement via custom native module or Shortcuts trigger
    console.log('[DND] Would disable iOS Focus mode');
    return false;
  }

  return false;
}

/**
 * Get instructions for setting up DND automation.
 * Used in the onboarding flow and settings screen.
 */
export function getDNDSetupInstructions(): { title: string; steps: string[] } {
  if (Platform.OS === 'ios') {
    return {
      title: 'Set up Focus Mode Automation',
      steps: [
        'Open the Shortcuts app on your iPhone',
        'Tap the Automation tab at the bottom',
        'Tap "+ New Automation"',
        'Select "App" as the trigger',
        'Choose "Summis" and select "Is Opened"',
        'Add the action "Set Focus" → choose your Focus mode',
        'Toggle off "Ask Before Running"',
        'Tap Done',
      ],
    };
  }

  if (Platform.OS === 'android') {
    return {
      title: 'Enable Do Not Disturb Access',
      steps: [
        'Summis needs permission to control Do Not Disturb',
        'Tap the button below to open DND settings',
        'Find "Summis" in the list and toggle it on',
        'Return to the app — sprints will now auto-enable DND',
      ],
    };
  }

  return {
    title: 'DND not available',
    steps: ['Do Not Disturb integration is only available on iOS and Android.'],
  };
}
