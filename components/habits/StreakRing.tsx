import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface StreakRingProps {
  streak: number;
  size?: number;
}

function getStreakColor(streak: number): string {
  if (streak >= 30) return Colors.warning; // gold
  if (streak >= 7) return Colors.success;  // green
  return Colors.textSecondary;              // gray
}

export function StreakRing({ streak, size = 48 }: StreakRingProps) {
  const color = getStreakColor(streak);

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.35 }]}>
        {streak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
