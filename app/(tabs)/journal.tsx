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
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { JournalEntry } from '@/types';

const MOOD_EMOJIS = ['', '\uD83D\uDE29', '\uD83D\uDE1F', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83E\uDD29'];
const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

export default function JournalScreen() {
  const session = useAppStore((s) => s.session);
  const data = useData();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);

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

  const handleSave = async () => {
    if (!content.trim()) return;
    if (!session?.user?.id) return;

    try {
      const entry = await data.createJournalEntry(session.user.id, {
        content: content.trim(),
        mood,
        energy_level: energy,
        tags: [],
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
    setMood(3);
    setEnergy(3);
    setShowForm(false);
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryMood}>{MOOD_EMOJIS[item.mood ?? 3]}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.subtitle}>{entries.length} entries</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.formTitle}>New Entry</Text>

            <TextInput
              style={styles.textArea}
              placeholder="How was your day? What did you learn?"
              placeholderTextColor={Colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel="Journal content"
            />

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
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  entryMood: {
    fontSize: 24,
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
    padding: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
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
