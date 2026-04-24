import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

export const ENTITLEMENTS = {
  pro: 'Summis Pro',
} as const;

export const PRODUCT_IDS = {
  monthly: 'com.summis.pro.monthly',
  annual: 'com.summis.pro.annual',
  lifetime: 'com.summis.lifetime',
} as const;

let configured = false;

export async function configureRevenueCat(): Promise<boolean> {
  if (configured) return true;

  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_RC_KEY_IOS ?? ''
      : process.env.EXPO_PUBLIC_RC_KEY_ANDROID ?? '';

  if (!apiKey) {
    console.warn('RevenueCat API key not set. Subscriptions will not work.');
    return false;
  }

  await Purchases.configure({ apiKey });
  configured = true;
  return true;
}

export async function initRevenueCat(userId: string): Promise<void> {
  const ready = await configureRevenueCat();
  if (!ready) return;
  await Purchases.logIn(userId);
}

export async function checkProAccess(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENTS.pro] !== 'undefined'
    );
  } catch (err) {
    console.error('RevenueCat checkProAccess failed:', err);
    return false;
  }
}

export async function getActiveTier(): Promise<'free' | 'pro' | 'lifetime' | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const active = customerInfo.entitlements.active[ENTITLEMENTS.pro];
    if (!active) return 'free';
    const productId = active.productIdentifier;
    if (productId === PRODUCT_IDS.lifetime) return 'lifetime';
    return 'pro';
  } catch (err) {
    console.error('RevenueCat getActiveTier failed:', err);
    return null;
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current?.availablePackages) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (err) {
    console.error('RevenueCat getOfferings failed:', err);
    return [];
  }
}

export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro =
      typeof customerInfo.entitlements.active[ENTITLEMENTS.pro] !== 'undefined';
    return { success: isPro, customerInfo };
  } catch (e: unknown) {
    if (e instanceof Error && 'userCancelled' in e && (e as Record<string, unknown>).userCancelled) {
      return { success: false };
    }
    console.error('RevenueCat purchasePackage failed:', e);
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENTS.pro] !== 'undefined'
    );
  } catch (err) {
    console.error('RevenueCat restorePurchases failed:', err);
    return false;
  }
}
