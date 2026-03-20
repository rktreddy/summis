import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { MultiplierResult, DomainMultiplier } from '@/lib/multiplier';

interface MultiplierStackProps {
  result: MultiplierResult;
  onPress?: () => void;
}

const TREND_ICONS: Record<string, { icon: string; color: string }> = {
  up: { icon: '\u25B2', color: Colors.success },
  flat: { icon: '\u2500', color: Colors.textSecondary },
  down: { icon: '\u25BC', color: Colors.danger },
};

const DOMAIN_EMOJIS: Record<string, string> = {
  sleep: '\uD83D\uDE34',
  exercise: '\uD83C\uDFC3',
  focus: '\uD83C\uDFAF',
  habits: '\u2705',
  recovery: '\u2744\uFE0F',
};

export function MultiplierStack({ result, onPress }: MultiplierStackProps) {
  return (
    <Card style={styles.container} onPress={onPress}>
      <Text style={styles.heading}>Your 1000x Stack</Text>

      <View style={styles.domains}>
        {result.domains.map((d) => (
          <DomainRow key={d.domain} domain={d} />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Multiplier</Text>
        <Text style={styles.totalValue}>{result.totalMultiplier.toFixed(1)}x</Text>
      </View>

      {result.daysToTenX != null && result.daysToTenX > 0 && (
        <Text style={styles.projection}>
          At this pace \u2192 10x in {result.daysToTenX} days
        </Text>
      )}
      {result.daysToTenX === 0 && (
        <Text style={[styles.projection, { color: Colors.success }]}>
          You've reached 10x! Keep compounding.
        </Text>
      )}
    </Card>
  );
}

function DomainRow({ domain: d }: { domain: DomainMultiplier }) {
  const trend = TREND_ICONS[d.trend];
  const emoji = DOMAIN_EMOJIS[d.domain] ?? '';

  return (
    <View style={styles.domainRow}>
      <Text style={styles.domainEmoji}>{emoji}</Text>
      <Text style={styles.domainLabel}>{d.label}</Text>
      <Text style={[styles.multiplierValue, d.multiplier > 1.0 && { color: Colors.success }]}>
        {d.multiplier.toFixed(1)}x
      </Text>
      <Text style={[styles.trendIcon, { color: trend.color }]}>{trend.icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  heading: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  domains: {
    gap: 8,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainEmoji: {
    fontSize: 16,
    width: 24,
  },
  domainLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  multiplierValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 45,
    textAlign: 'right',
  },
  trendIcon: {
    fontSize: 10,
    marginLeft: 8,
    width: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },
  projection: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
