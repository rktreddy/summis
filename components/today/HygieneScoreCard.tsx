import { View, Text, StyleSheet } from 'react-native';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';

interface HygieneScoreCardProps {
  score: number;
  activeCount: number;
  compliantCount: number;
  onPress?: () => void;
}

export function HygieneScoreCard({ score, activeCount, compliantCount, onPress }: HygieneScoreCardProps) {
  const color = score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.row} accessibilityLabel={`Cognitive hygiene score: ${score}%. ${compliantCount} of ${activeCount} practices followed`}>
        <ProgressRing progress={score / 100} size={64} color={color} />
        <View style={styles.info}>
          <Text style={styles.label}>Cognitive Hygiene</Text>
          <Text style={styles.detail}>
            {compliantCount} of {activeCount} practices followed
          </Text>
          {score === 0 && activeCount > 0 && (
            <Text style={styles.hint}>Complete your hygiene check before sprinting</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  detail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  hint: {
    fontSize: 13,
    color: Colors.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
