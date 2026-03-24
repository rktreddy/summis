import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountability } from '@/hooks/useAccountability';
import { useHabits } from '@/hooks/useHabits';
import { PartnerCard } from '@/components/social/PartnerCard';
import { ChallengeCard } from '@/components/social/ChallengeCard';
import { CHALLENGE_DURATIONS } from '@/lib/accountability';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';

export default function AccountabilityScreen() {
  const router = useRouter();
  const { partner, challenges, loading, fetchPartner, invitePartner, createChallenge } = useAccountability();
  const { habits } = useHabits();
  const [email, setEmail] = useState('');
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [challengeHabit, setChallengeHabit] = useState('');
  const [challengeDays, setChallengeDays] = useState(7);

  useEffect(() => {
    fetchPartner();
  }, [fetchPartner]);

  async function handleInvite() {
    if (!email.trim() || !email.includes('@')) {
      const msg = 'Please enter a valid email address.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Invalid Email', msg);
      return;
    }
    await invitePartner(email.trim());
    setEmail('');
    const msg = 'Invite sent!';
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Sent', msg);
  }

  async function handleCreateChallenge() {
    if (!challengeHabit.trim()) return;
    await createChallenge(challengeHabit.trim(), challengeDays);
    setShowNewChallenge(false);
    setChallengeHabit('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Accountability</Text>
          <Text style={styles.subtitle}>
            Research: people with accountability partners achieve 76% completion rates vs 43% solo.
          </Text>
        </View>

        {partner ? (
          <>
            <Text style={styles.sectionTitle}>Your Partner</Text>
            <PartnerCard partner={partner} />

            <View style={styles.challengeHeader}>
              <Text style={styles.sectionTitle}>Challenges</Text>
              {!showNewChallenge && (
                <TouchableOpacity onPress={() => setShowNewChallenge(true)}>
                  <Text style={styles.addLink}>+ New</Text>
                </TouchableOpacity>
              )}
            </View>

            {showNewChallenge && (
              <Card style={styles.newChallenge}>
                <Text style={styles.label}>Habit to challenge</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Morning Meditation"
                  placeholderTextColor={Colors.textSecondary}
                  value={challengeHabit}
                  onChangeText={setChallengeHabit}
                  accessibilityLabel="Challenge habit"
                />

                {habits.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitSuggestions}>
                    {habits.slice(0, 5).map((h) => (
                      <TouchableOpacity
                        key={h.id}
                        style={[styles.habitChip, challengeHabit === h.title && styles.habitChipActive]}
                        onPress={() => setChallengeHabit(h.title)}
                      >
                        <Text style={[styles.habitChipText, challengeHabit === h.title && styles.habitChipTextActive]}>
                          {h.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                  {CHALLENGE_DURATIONS.map((d) => (
                    <TouchableOpacity
                      key={d.days}
                      style={[styles.durationChip, challengeDays === d.days && styles.durationActive]}
                      onPress={() => setChallengeDays(d.days)}
                    >
                      <Text style={[styles.durationText, challengeDays === d.days && styles.durationTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.challengeButtons}>
                  <Button title="Cancel" onPress={() => setShowNewChallenge(false)} variant="secondary" style={styles.halfBtn} />
                  <Button title="Start Challenge" onPress={handleCreateChallenge} disabled={!challengeHabit.trim()} style={styles.halfBtn} />
                </View>
              </Card>
            )}

            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                userName="You"
                partnerName={partner.partner_name ?? 'Partner'}
              />
            ))}

            {challenges.length === 0 && !showNewChallenge && (
              <Text style={styles.emptyText}>No active challenges. Start one to compete!</Text>
            )}
          </>
        ) : (
          <Card style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>Add an Accountability Partner</Text>
            <Text style={styles.inviteDesc}>
              Enter their email to send an invite. You'll see each other's streak counts and can create challenges.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="partner@email.com"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="go"
              onSubmitEditing={handleInvite}
              accessibilityLabel="Partner email"
            />
            <Button title="Send Invite" onPress={handleInvite} />

            <Text style={styles.privacyNote}>
              Partners only see your display name and streak counts. They never see your journal, mood, or habit details.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  backBtn: { color: Colors.accent, fontSize: 15, fontWeight: '500', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  addLink: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
  newChallenge: { marginBottom: 12 },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 6 },
  input: { backgroundColor: Colors.inputBg, borderRadius: 10, padding: 14, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  habitSuggestions: { marginBottom: 12 },
  habitChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  habitChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '20' },
  habitChipText: { color: Colors.textSecondary, fontSize: 12 },
  habitChipTextActive: { color: Colors.accent },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  durationChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  durationActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '20' },
  durationText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  durationTextActive: { color: Colors.accent },
  challengeButtons: { flexDirection: 'row', gap: 12 },
  halfBtn: { flex: 1 },
  emptyText: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 20 },
  inviteCard: { marginTop: 8 },
  inviteTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  inviteDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  privacyNote: { color: Colors.textSecondary, fontSize: 11, fontStyle: 'italic', marginTop: 14, textAlign: 'center', lineHeight: 16 },
});
