import { View, Text, StyleSheet, Share, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { JournalEntry as JournalEntryType } from '@/types';

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete?: () => void;
  canExport: boolean;
}

const MOOD_EMOJIS = ['', '\uD83D\uDE29', '\uD83D\uDE1F', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83E\uDD29'];
const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

export function JournalEntryCard({ entry, onDelete, canExport }: JournalEntryProps) {
  async function handleExport() {
    const dateStr = new Date(entry.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const moodStr = entry.mood ? `Mood: ${MOOD_EMOJIS[entry.mood]}` : '';
    const energyStr = entry.energy_level ? `Energy: ${ENERGY_LABELS[entry.energy_level]}` : '';

    const text = [
      `--- ${dateStr} ---`,
      moodStr,
      energyStr,
      '',
      entry.content,
      '',
      entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Share.share({ message: text, title: `Journal Entry — ${dateStr}` });
  }

  function handleLongPress() {
    if (!onDelete) return;

    Alert.alert('Delete Entry', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <Card style={styles.card}>
      <TouchableOpacity onLongPress={handleLongPress} accessibilityLabel="Journal entry">
        <View style={styles.header}>
          <Text style={styles.mood}>{MOOD_EMOJIS[entry.mood ?? 3]}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.date}>
              {new Date(entry.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            {canExport && (
              <TouchableOpacity
                onPress={handleExport}
                accessibilityLabel="Export entry"
                style={styles.exportBtn}
              >
                <Text style={styles.exportIcon}>{'\u2197'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.content} numberOfLines={6}>
          {entry.content}
        </Text>

        <View style={styles.footer}>
          {entry.energy_level && (
            <Text style={styles.energy}>
              Energy: {ENERGY_LABELS[entry.energy_level]}
            </Text>
          )}
          {entry.tags.length > 0 && (
            <View style={styles.tags}>
              {entry.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mood: {
    fontSize: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  exportBtn: {
    padding: 4,
  },
  exportIcon: {
    fontSize: 16,
    color: Colors.accent,
  },
  content: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  energy: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '500',
  },
});
