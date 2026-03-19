import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchased: () => void;
}

const PRO_FEATURES = [
  'Unlimited habits',
  'AI-powered insights',
  'Performance analytics & charts',
  'Weekly performance reports',
  'Journal export',
  'Science-backed protocols',
];

export function PaywallModal({ visible, onClose, onPurchased }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  async function loadOfferings() {
    const pkgs = await getOfferings();
    setPackages(pkgs);
    // Default to annual if available
    const annualIdx = pkgs.findIndex((p) => p.identifier === '$rc_annual');
    if (annualIdx >= 0) setSelectedIndex(annualIdx);
  }

  async function handlePurchase() {
    if (packages.length === 0) return;
    setPurchasing(true);
    setError('');

    try {
      const { success } = await purchasePackage(packages[selectedIndex]);
      if (success) {
        onPurchased();
        onClose();
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
    <Modal visible={visible} animationType="slide" transparent>
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
            <Text style={styles.title}>Unlock 1000x Pro</Text>
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
            ) : (
              <ActivityIndicator color={Colors.accent} style={styles.loader} />
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
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
