import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { HygieneCorrelation } from '@/types/summis';

interface HygieneCorrelationCardProps {
  correlation: HygieneCorrelation;
}

const STRENGTH_COLORS = {
  strong: Colors.success,
  moderate: Colors.warning,
  weak: Colors.textSecondary,
};

export function HygieneCorrelationCard({ correlation }: HygieneCorrelationCardProps) {
  const strengthColor = STRENGTH_COLORS[correlation.strengthLabel];

  if (correlation.highCompleter) {
    return (
      <Card style={styles.container}>
        <Text style={styles.practiceLabel}>{correlation.practiceLabel}</Text>
        <Text style={styles.edgeCaseText}>
          You follow this practice too consistently to measure its isolated impact — that's a good sign.
        </Text>
      </Card>
    );
  }

  if (correlation.lowCompleter) {
    return (
      <Card style={styles.container}>
        <Text style={styles.practiceLabel}>{correlation.practiceLabel}</Text>
        <Text style={styles.edgeCaseText}>
          Follow this practice more consistently to unlock its impact score.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.practiceLabel}>{correlation.practiceLabel}</Text>
        <View style={[styles.badge, { backgroundColor: strengthColor + '20' }]}>
          <Text style={[styles.badgeText, { color: strengthColor }]}>
            {correlation.strengthLabel} link
          </Text>
        </View>
      </View>

      <View style={styles.complianceBar} accessibilityLabel={`Compliance rate: ${Math.round(correlation.complianceRate * 100)}%`} accessibilityRole="progressbar">
        <View style={[styles.complianceFill, { width: `${Math.round(correlation.complianceRate * 100)}%` }]} />
      </View>
      <Text style={styles.complianceLabel}>
        {Math.round(correlation.complianceRate * 100)}% compliance
      </Text>

      <Text style={styles.insightText}>{correlation.insightText}</Text>

      <Text style={styles.finePrint}>
        r = {correlation.correlation.toFixed(2)} · {correlation.sampleSize} days of data
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  complianceBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  complianceFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  complianceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  edgeCaseText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 8,
  },
  finePrint: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
