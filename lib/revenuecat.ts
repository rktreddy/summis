import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

export const ENTITLEMENTS = {
  pro: 'pro_access',
} as const;

export const PRODUCT_IDS = {
  monthly: 'com.1000x.pro.monthly',
  annual: 'com.1000x.pro.annual',
  lifetime: 'com.1000x.lifetime',
} as const;

export async function initRevenueCat(userId: string): Promise<void> {
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_RC_KEY_IOS ?? ''
      : process.env.EXPO_PUBLIC_RC_KEY_ANDROID ?? '';

  if (!apiKey) {
    console.warn('RevenueCat API key not set. Subscriptions will not work.');
    return;
  }

  await Purchases.configure({ apiKey });
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
