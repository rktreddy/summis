import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { PRODUCT_IDS } from '@/lib/revenuecat';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://summis.app/privacy';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchased: () => void;
}

const PRO_FEATURES = [
  'Unlimited focus sprints',
  'Hygiene × focus correlations',
  'AI-powered cognitive insights',
  'Advanced performance analytics',
  'Weekly performance reports',
  'Science-backed protocols library',
];

export function PaywallModal({ visible, onClose, onPurchased }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [offeringsError, setOfferingsError] = useState('');

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  async function loadOfferings() {
    setLoadingOfferings(true);
    setOfferingsError('');
    try {
      const pkgs = await getOfferings();
      setPackages(pkgs);
      if (pkgs.length === 0) {
        setOfferingsError(
          'Subscriptions are temporarily unavailable. Please check your connection and try again.'
        );
      } else {
        const annualIdx = pkgs.findIndex((p) => p.identifier === '$rc_annual');
        if (annualIdx >= 0) setSelectedIndex(annualIdx);
      }
    } catch {
      setOfferingsError(
        'Unable to load subscription options. Please try again.'
      );
    } finally {
      setLoadingOfferings(false);
    }
  }

  async function handlePurchase() {
    if (packages.length === 0) return;
    setPurchasing(true);
    setError('');

    try {
      const pkg = packages[selectedIndex];
      const { success } = await purchasePackage(pkg);
      if (success) {
        // Mirror the RevenueCat entitlement into local profile state so
        // the UI reflects Pro immediately. The authoritative tier update
        // happens server-side via RevenueCat webhook → Supabase.
        const tier = pkg.product.identifier === PRODUCT_IDS.lifetime ? 'lifetime' : 'pro';
        const current = useAppStore.getState().profile;
        if (current) {
          useAppStore.getState().setProfile({ ...current, subscription_tier: tier });
        }
        onPurchased();
        onClose();
      } else {
        setError('Purchase did not complete. If you were charged, tap Restore Purchases.');
      }
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setError('');

    try {
      const restored = await restorePurchases();
      if (restored) {
        const current = useAppStore.getState().profile;
        if (current && current.subscription_tier === 'free') {
          useAppStore.getState().setProfile({ ...current, subscription_tier: 'pro' });
        }
        onPurchased();
        onClose();
      } else {
        setError('No active subscription found.');
      }
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close paywall"
            >
              <Text style={styles.closeBtnText}>{'\u2715'}</Text>
            </TouchableOpacity>

            <Text style={styles.badge}>PRO</Text>
            <Text style={styles.title}>Unlock Summis Pro</Text>
            <Text style={styles.subtitle}>
              Science-backed tools for peak performance
            </Text>

            <View style={styles.features}>
              {PRO_FEATURES.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>{'\u2713'}</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {packages.length > 0 ? (
              <View style={styles.packages}>
                {packages.map((pkg, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isAnnual = pkg.identifier === '$rc_annual';

                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[styles.packageCard, isSelected && styles.packageSelected]}
                      onPress={() => setSelectedIndex(idx)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Select ${pkg.product.title}`}
                    >
                      {isAnnual && (
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>BEST VALUE</Text>
                        </View>
                      )}
                      <Text style={[styles.packageTitle, isSelected && styles.packageTitleSelected]}>
                        {pkg.product.title}
                      </Text>
                      <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                        {pkg.product.priceString}
                      </Text>
                      {pkg.product.description ? (
                        <Text style={styles.packageDesc}>{pkg.product.description}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : loadingOfferings ? (
              <ActivityIndicator color={Colors.accent} style={styles.loader} />
            ) : (
              <View style={styles.offeringsErrorBox}>
                <Text style={styles.offeringsErrorText}>
                  {offeringsError || 'Subscriptions are temporarily unavailable.'}
                </Text>
                <TouchableOpacity
                  onPress={loadOfferings}
                  accessibilityLabel="Retry loading subscriptions"
                >
                  <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Subscribe Now"
              onPress={handlePurchase}
              loading={purchasing}
              disabled={packages.length === 0}
              style={styles.subscribeBtn}
            />

            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring}
              accessibilityLabel="Restore purchases"
            >
              <Text style={styles.restoreText}>
                {restoring ? 'Restoring...' : 'Restore Purchases'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.legal}>
              Payment will be charged to your App Store account. Subscription
              automatically renews unless cancelled at least 24 hours before the
              end of the current period. Manage subscriptions in Settings.
            </Text>

            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                onPress={() => Linking.openURL(TERMS_URL)}
                accessibilityLabel="Open Terms of Use"
              >
                <Text style={styles.legalLink}>Terms of Use (EULA)</Text>
              </TouchableOpacity>
              <Text style={styles.legalLinkSeparator}>·</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(PRIVACY_URL)}
                accessibilityLabel="Open Privacy Policy"
              >
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 20,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: Colors.accent,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureCheck: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  featureText: {
    color: Colors.text,
    fontSize: 15,
  },
  packages: {
    gap: 10,
    marginBottom: 20,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: Colors.card,
  },
  packageSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  packageTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  packageTitleSelected: {
    color: Colors.text,
  },
  packagePrice: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  packagePriceSelected: {
    color: Colors.accent,
  },
  packageDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  subscribeBtn: {
    marginBottom: 12,
  },
  restoreText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  legal: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  legalLink: {
    color: Colors.accent,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalLinkSeparator: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginHorizontal: 8,
  },
  offeringsErrorBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
  },
  offeringsErrorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  retryText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
