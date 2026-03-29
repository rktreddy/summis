import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { useSubscription } from '@/hooks/useSubscription';
import { formatAsText } from '@/lib/journal-export';
import {
  JOURNAL_MODES,
  getReflectionPrompt,
  formatGratitudeEntries,
  formatReflectionEntry,
  type JournalMode,
} from '@/lib/journal-prompts';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { JournalEntry } from '@/types';

const MOOD_EMOJIS = ['', '\uD83D\uDE29', '\uD83D\uDE1F', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83E\uDD29'];
const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
const MODE_LABELS: Record<string, string> = { free: '', gratitude: '\uD83D\uDE4F', reflection: '\uD83D\uDCAD' };

export default function JournalScreen() {
  const session = useAppStore((s) => s.session);
  const data = useData();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { isPro } = useSubscription();
  const [mode, setMode] = useState<JournalMode>('free');
  const [content, setContent] = useState('');
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);

  const reflectionPrompt = getReflectionPrompt();

  const fetchEntries = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const result = await data.fetchJournalEntries(session.user.id);
      setEntries(result);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to load entries. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, data]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function getContentForSave(): string {
    switch (mode) {
      case 'gratitude':
        return formatGratitudeEntries(gratitudeItems);
      case 'reflection':
        return formatReflectionEntry(reflectionPrompt, content);
      default:
        return content.trim();
    }
  }

  const handleSave = async () => {
    const finalContent = getContentForSave();
    if (!finalContent) return;
    if (!session?.user?.id) return;

    try {
      const entry = await data.createJournalEntry(session.user.id, {
        content: finalContent,
        mood,
        energy_level: energy,
        tags: mode === 'gratitude' ? ['gratitude'] : mode === 'reflection' ? ['reflection'] : [],
        journal_mode: mode,
      });
      if (entry) {
        setEntries((prev) => [entry, ...prev]);
      } else {
        await fetchEntries();
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry. Please try again.');
      return;
    }

    setContent('');
    setGratitudeItems(['', '', '']);
    setMood(3);
    setEnergy(3);
    setShowForm(false);
  };

  const handleExport = async () => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    if (entries.length === 0) {
      if (Platform.OS === 'web') {
        alert('No entries to export.');
      } else {
        Alert.alert('No Entries', 'Write some journal entries first.');
      }
      return;
    }
    const text = formatAsText(entries);
    try {
      await Share.share({ message: text, title: 'Summis Journal Export' });
    } catch {
      // User cancelled share
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryHeaderLeft}>
          <Text style={styles.entryMood}>{MOOD_EMOJIS[item.mood ?? 3]}</Text>
          {item.journal_mode && item.journal_mode !== 'free' && (
            <Text style={styles.entryModeBadge}>{MODE_LABELS[item.journal_mode]}</Text>
          )}
        </View>
        <Text style={styles.entryDate}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.entryContent} numberOfLines={4}>
        {item.content}
      </Text>
      {item.energy_level && (
        <Text style={styles.entryEnergy}>
          Energy: {ENERGY_LABELS[item.energy_level]}
        </Text>
      )}
    </Card>
  );

  function updateGratitudeItem(index: number, value: string) {
    setGratitudeItems((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>{entries.length} entries</Text>
          </View>
          {entries.length > 0 && (
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={handleExport}
              accessibilityLabel="Export journal"
            >
              <Text style={styles.exportBtnText}>
                {isPro ? 'Export' : 'Export \uD83D\uDD12'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => { setError(null); fetchEntries(); }}
          onDismiss={() => setError(null)}
        />
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchEntries}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>
              Reflect on your day to track patterns
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
        accessibilityLabel="New journal entry"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.formTitle}>New Entry</Text>

            <View style={styles.modeSelector}>
              {JOURNAL_MODES.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.modeChip, mode === m.key && styles.modeChipActive]}
                  onPress={() => setMode(m.key)}
                  accessibilityLabel={`Mode: ${m.label}`}
                >
                  <Text style={styles.modeIcon}>{m.icon}</Text>
                  <Text style={[styles.modeLabel, mode === m.key && styles.modeLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mode === 'reflection' && (
              <View style={styles.promptCard}>
                <Text style={styles.promptLabel}>Today's prompt</Text>
                <Text style={styles.promptText}>{reflectionPrompt}</Text>
              </View>
            )}

            {mode === 'gratitude' ? (
              <View style={styles.gratitudeFields}>
                <Text style={styles.label}>I'm grateful for...</Text>
                {gratitudeItems.map((item, i) => (
                  <View key={i} style={styles.gratitudeRow}>
                    <Text style={styles.gratitudeNum}>{i + 1}.</Text>
                    <TextInput
                      style={styles.gratitudeInput}
                      placeholder={
                        i === 0 ? 'Something that made you smile...'
                        : i === 1 ? 'Someone who helped you...'
                        : 'A small thing you appreciate...'
                      }
                      placeholderTextColor={Colors.textSecondary}
                      value={item}
                      onChangeText={(v) => updateGratitudeItem(i, v)}
                      accessibilityLabel={`Gratitude item ${i + 1}`}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.textArea}
                placeholder={
                  mode === 'reflection'
                    ? 'Your thoughts...'
                    : 'How was your day? What did you learn?'
                }
                placeholderTextColor={Colors.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                accessibilityLabel="Journal content"
              />
            )}

            <Text style={styles.label}>Mood</Text>
            <View style={styles.selector}>
              {[1, 2, 3, 4, 5].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.selectorItem, mood === v && styles.selectorActive]}
                  onPress={() => setMood(v)}
                  accessibilityLabel={`Mood ${v}`}
                >
                  <Text style={styles.selectorEmoji}>{MOOD_EMOJIS[v]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Energy Level</Text>
            <View style={styles.selector}>
              {[1, 2, 3, 4, 5].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.selectorItem, energy === v && styles.selectorActive]}
                  onPress={() => setEnergy(v)}
                  accessibilityLabel={`Energy ${v}`}
                >
                  <Text style={styles.selectorText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formButtons}>
              <Button title="Cancel" onPress={() => setShowForm(false)} variant="secondary" style={{ flex: 1 }} />
              <Button title="Save" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => setShowPaywall(false)}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.accent + '20',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  exportBtnText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  entryCard: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryMood: {
    fontSize: 24,
  },
  entryModeBadge: {
    fontSize: 14,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  entryContent: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  entryEnergy: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    color: Colors.text,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalContentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  modeIcon: {
    fontSize: 16,
  },
  modeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: Colors.accent,
  },
  promptCard: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  promptLabel: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promptText: {
    color: Colors.text,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  gratitudeFields: {
    marginBottom: 16,
  },
  gratitudeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gratitudeNum: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
    width: 20,
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectorItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  selectorEmoji: {
    fontSize: 20,
  },
  selectorText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
