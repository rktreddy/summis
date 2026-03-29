import type { JournalEntry } from '@/types';

const MOOD_LABELS = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Great'];
const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

export function formatAsText(entries: JournalEntry[]): string {
  const lines = ['Summis Journal Export', `Exported: ${new Date().toLocaleDateString()}`, `Entries: ${entries.length}`, '', '---', ''];

  for (const entry of entries) {
    const date = new Date(entry.created_at).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    lines.push(date);
    lines.push(`Mood: ${MOOD_LABELS[entry.mood ?? 3]}  |  Energy: ${ENERGY_LABELS[entry.energy_level ?? 3]}`);
    lines.push('');
    lines.push(entry.content);
    if (entry.tags.length > 0) {
      lines.push('');
      lines.push(`Tags: ${entry.tags.join(', ')}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

export function formatAsCsv(entries: JournalEntry[]): string {
  const header = 'Date,Mood,Energy,Tags,Content';
  const rows = entries.map((entry) => {
    const date = new Date(entry.created_at).toISOString();
    const mood = MOOD_LABELS[entry.mood ?? 3];
    const energy = ENERGY_LABELS[entry.energy_level ?? 3];
    const tags = entry.tags.join('; ');
    const content = `"${entry.content.replace(/"/g, '""')}"`;
    return `${date},${mood},${energy},"${tags}",${content}`;
  });

  return [header, ...rows].join('\n');
}
