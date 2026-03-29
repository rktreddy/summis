import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface TrendLabelProps {
  trend: 'rising' | 'plateau' | 'declining';
}

const TREND_CONFIG = {
  rising: { label: 'Rising', icon: 'trending-up' as const, color: Colors.success },
  plateau: { label: 'Plateau', icon: 'remove' as const, color: Colors.warning },
  declining: { label: 'Declining', icon: 'trending-down' as const, color: Colors.danger },
};

export function TrendLabel({ trend }: TrendLabelProps) {
  const config = TREND_CONFIG[trend];
  return (
    <View style={[styles.container, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
