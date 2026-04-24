import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { restorePurchases, getActiveTier } from '@/lib/revenuecat';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { Colors } from '@/constants/Colors';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  lifetime: 'Lifetime',
};

const TIER_COLORS: Record<string, string> = {
  free: Colors.textSecondary,
  pro: Colors.accent,
  lifetime: Colors.warning,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, session } = useAppStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        const tier = await getActiveTier();
        const current = useAppStore.getState().profile;
        if (current && tier && tier !== 'free') {
          useAppStore.getState().setProfile({ ...current, subscription_tier: tier });
        }
        Alert.alert('Purchases Restored', 'Your Pro subscription is active on this device.');
      } else {
        Alert.alert(
          'No Active Subscription',
          "We couldn't find an active subscription on this Apple ID. If you were charged, make sure you're signed into the same Apple ID used to purchase."
        );
      }
    } catch {
      Alert.alert('Restore Failed', 'Please try again or contact support@summis.app.');
    } finally {
      setRestoring(false);
    }
  }

  async function handleManageSubscription() {
    try {
      await Linking.openURL('itms-apps://apps.apple.com/account/subscriptions');
    } catch {
      Alert.alert(
        'Unable to open Settings',
        'Open the App Store app → your profile → Subscriptions to manage or cancel.'
      );
    }
  }

  async function performDelete() {
    setDeleting(true);
    try {
      const { data: { session: current } } = await supabase.auth.getSession();
      const accessToken = current?.access_token;
      if (!accessToken) {
        throw new Error('Not signed in.');
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
      });

      const rawBody = await response.text();
      if (!response.ok) {
        let message = `Delete failed (${response.status})`;
        try {
          const parsed = JSON.parse(rawBody);
          if (parsed?.error) message = parsed.error;
        } catch {
          if (rawBody) message = `${message}: ${rawBody.slice(0, 200)}`;
        }
        throw new Error(message);
      }

      // Sign out locally — the server already invalidated the auth user
      await supabase.auth.signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      Alert.alert('Delete failed', `${message}\n\nPlease try again or contact support.`);
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account?',
      'This permanently deletes your account and all associated data (sprints, MITs, hygiene logs, preferences). This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This is your last chance. Tap Delete to permanently remove your account.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete },
              ]
            );
          },
        },
      ]
    );
  }

  const tier = profile?.subscription_tier ?? 'free';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
        showsVerticalScrollIndicator
      >
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.display_name ?? 'User'}</Text>
          <View style={[styles.tierBadge, { backgroundColor: (TIER_COLORS[tier] ?? Colors.textSecondary) + '20' }]}>
            <Text style={[styles.tierText, { color: TIER_COLORS[tier] ?? Colors.textSecondary }]}>
              {TIER_LABELS[tier] ?? 'Free'}
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{session?.user?.id ? 'Authenticated' : '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timezone</Text>
            <Text style={styles.infoValue}>{profile?.timezone ?? 'UTC'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </Card>

        <Button
          title="Accountability Partner"
          onPress={() => router.push('/accountability')}
          variant="secondary"
          style={styles.accountabilityBtn}
          accessibilityLabel="Manage accountability partner"
        />

        <Button
          title="Daily Plan"
          onPress={() => router.push('/daily-plan')}
          variant="secondary"
          style={styles.planBtn}
          accessibilityLabel="Open daily planner"
        />

        {tier === 'free' && (
          <Button
            title="Upgrade to Pro — $7.99/mo"
            onPress={() => setShowPaywall(true)}
            style={styles.upgradeBtn}
            accessibilityLabel="Upgrade to Pro"
          />
        )}

        {tier === 'pro' && (
          <Button
            title="Manage Subscription"
            onPress={handleManageSubscription}
            variant="secondary"
            style={styles.restoreBtn}
            accessibilityLabel="Manage or cancel subscription in App Store"
          />
        )}

        <Button
          title={restoring ? 'Restoring…' : 'Restore Purchases'}
          onPress={handleRestore}
          loading={restoring}
          variant="secondary"
          style={styles.restoreBtn}
          accessibilityLabel="Restore purchases"
        />

        <Button
          title="Privacy Policy"
          onPress={() => router.push('/privacy-policy')}
          variant="secondary"
          style={styles.privacyBtn}
          accessibilityLabel="View privacy policy"
        />

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutBtn}
          accessibilityLabel="Sign out"
        />

        <Button
          title={deleting ? 'Deleting…' : 'Delete Account'}
          onPress={handleDeleteAccount}
          variant="danger"
          style={styles.deleteBtn}
          loading={deleting}
          accessibilityLabel="Delete account permanently"
        />
        <Text style={styles.deleteHelpText}>
          Permanently deletes your account and all associated data. This cannot be undone.
        </Text>
      </ScrollView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => { /* Profile refreshed on next auth event */ }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  accountabilityBtn: {
    marginBottom: 12,
  },
  planBtn: {
    marginBottom: 12,
  },
  upgradeBtn: {
    marginBottom: 12,
  },
  restoreBtn: {
    marginBottom: 12,
  },
  privacyBtn: {
    marginBottom: 12,
  },
  signOutBtn: {
    marginBottom: 12,
  },
  deleteBtn: {
    marginTop: 24,
    marginBottom: 8,
  },
  deleteHelpText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
