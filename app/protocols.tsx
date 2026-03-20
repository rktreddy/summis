import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SCIENCE_PROTOCOLS, type ScienceProtocol } from '@/lib/science-protocols';
import { getProtocolHabits } from '@/lib/active-protocols';
import { useSubscription } from '@/hooks/useSubscription';
import { useHabits } from '@/hooks/useHabits';
import { useAppStore } from '@/store/useAppStore';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';

const CATEGORY_ICONS: Record<string, string> = {
  focus: '\uD83C\uDFAF',
  sleep: '\uD83C\uDF19',
  exercise: '\uD83C\uDFC3',
  nutrition: '\uD83E\uDD57',
  mindfulness: '\uD83E\uDDD8',
  recovery: '\u2744\uFE0F',
};

function ProtocolCard({
  protocol,
  locked,
  onPress,
}: {
  protocol: ScienceProtocol;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Card style={styles.protocolCard} onPress={onPress}>
      <View style={styles.protocolHeader}>
        <Text style={styles.protocolIcon}>
          {CATEGORY_ICONS[protocol.category] ?? '\uD83D\uDCA1'}
        </Text>
        <View style={styles.protocolMeta}>
          <Text style={styles.protocolTitle}>{protocol.title}</Text>
          <Text style={styles.protocolCategory}>{protocol.category}</Text>
        </View>
        {locked && <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>}
        {protocol.durationMinutes && (
          <Text style={styles.protocolDuration}>{protocol.durationMinutes}m</Text>
        )}
      </View>
      <Text style={styles.protocolSummary} numberOfLines={2}>
        {protocol.summary}
      </Text>
    </Card>
  );
}

export default function ProtocolsScreen() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const { createHabit } = useHabits();
  const session = useAppStore((s) => s.session);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ScienceProtocol | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState<Set<string>>(new Set());

  async function handleActivate(protocol: ScienceProtocol) {
    if (!session?.user?.id) return;
    setActivating(true);
    try {
      const presets = getProtocolHabits(protocol.id);
      for (const preset of presets) {
        await createHabit({
          title: preset.title,
          description: preset.description,
          category: preset.category,
          difficulty: preset.difficulty,
          trigger_cue: preset.trigger_cue,
        });
      }
      setActivated((prev) => new Set(prev).add(protocol.id));
      if (Platform.OS === 'web') {
        alert(`${protocol.title} activated! ${presets.length} habits created.`);
      } else {
        Alert.alert('Protocol Activated', `${presets.length} habits created from ${protocol.title}. Track them on your Today screen.`);
      }
    } catch (err) {
      console.error('Error activating protocol:', err);
      if (Platform.OS === 'web') {
        alert('Failed to activate protocol.');
      } else {
        Alert.alert('Error', 'Failed to activate protocol.');
      }
    } finally {
      setActivating(false);
    }
  }

  function handlePress(protocol: ScienceProtocol) {
    if (protocol.tier === 'pro' && !isPro) {
      setShowPaywall(true);
      return;
    }
    setSelectedProtocol(protocol);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Science Protocols</Text>
          <Text style={styles.subtitle}>
            Evidence-based routines backed by peer-reviewed research
          </Text>
        </View>

        {selectedProtocol ? (
          <View style={styles.detail}>
            <TouchableOpacity
              onPress={() => setSelectedProtocol(null)}
              accessibilityLabel="Back to protocols"
            >
              <Text style={styles.backLink}>{'\u2190'} All Protocols</Text>
            </TouchableOpacity>

            <Text style={styles.detailIcon}>
              {CATEGORY_ICONS[selectedProtocol.category] ?? '\uD83D\uDCA1'}
            </Text>
            <Text style={styles.detailTitle}>{selectedProtocol.title}</Text>
            <Text style={styles.detailSummary}>{selectedProtocol.summary}</Text>

            <Card style={styles.citationCard}>
              <Text style={styles.citationLabel}>Research Citation</Text>
              <Text style={styles.citationText}>{selectedProtocol.citation}</Text>
            </Card>

            <Text style={styles.stepsTitle}>How to Do It</Text>
            {selectedProtocol.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            {selectedProtocol.durationMinutes && (
              <Card style={styles.durationCard}>
                <Text style={styles.durationText}>
                  Suggested duration: {selectedProtocol.durationMinutes} minutes
                </Text>
              </Card>
            )}

            <Button
              title={activated.has(selectedProtocol.id) ? 'Activated \u2713' : 'Activate Protocol'}
              onPress={() => handleActivate(selectedProtocol)}
              loading={activating}
              disabled={activated.has(selectedProtocol.id)}
              style={styles.activateBtn}
            />
            {!activated.has(selectedProtocol.id) && (
              <Text style={styles.activateHint}>
                Creates {getProtocolHabits(selectedProtocol.id).length} habits on your Today screen
              </Text>
            )}
          </View>
        ) : (
          <>
            {SCIENCE_PROTOCOLS.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                locked={protocol.tier === 'pro' && !isPro}
                onPress={() => handlePress(protocol)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  protocolCard: {
    marginBottom: 12,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  protocolIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  protocolMeta: {
    flex: 1,
  },
  protocolTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  protocolCategory: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  protocolDuration: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  protocolSummary: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    gap: 4,
  },
  backLink: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  detailSummary: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  citationCard: {
    marginBottom: 20,
    backgroundColor: Colors.accent + '10',
    borderColor: Colors.accent + '30',
  },
  citationLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  citationText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  stepsTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 3,
  },
  durationCard: {
    marginTop: 12,
    alignItems: 'center',
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  activateBtn: {
    marginTop: 20,
  },
  activateHint: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
