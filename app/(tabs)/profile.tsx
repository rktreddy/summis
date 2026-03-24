import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { restorePurchases } from '@/lib/revenuecat';
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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const tier = profile?.subscription_tier ?? 'free';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
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

        <Button
          title="Restore Purchases"
          onPress={async () => {
            const restored = await restorePurchases();
            if (!restored) {
              // Could show an alert here
            }
          }}
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
      </View>

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
  content: {
    paddingHorizontal: 20,
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
});
