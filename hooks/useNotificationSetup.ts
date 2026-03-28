import { useEffect, useRef } from 'react';
import { registerForPushNotifications } from '@/lib/notifications';
import { useAppStore } from '@/store/useAppStore';

/**
 * Registers for push notifications once per session when the user is authenticated.
 * Uses a ref to prevent re-registration. Call from the tabs layout.
 */
export function useNotificationSetup() {
  const hasRegistered = useRef(false);
  const session = useAppStore((s) => s.session);

  useEffect(() => {
    if (hasRegistered.current || !session) return;
    hasRegistered.current = true;

    registerForPushNotifications().catch((err) => {
      // Non-critical — don't block the user
      console.warn('Push notification registration failed:', err);
    });
  }, [session]);
}
