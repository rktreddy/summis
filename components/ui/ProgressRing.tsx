import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@/constants/Colors';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  color = Colors.accent,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
    });
  }, [progress]);

  const percentage = Math.round(progress * 100);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: Colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.progressOverlay,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderLeftColor: 'transparent',
            borderBottomColor: progress > 0.5 ? color : 'transparent',
            transform: [{ rotate: `${progress * 360}deg` }],
          },
        ]}
      />
      <Text style={[styles.text, { fontSize: size * 0.25 }]}>
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressOverlay: {
    position: 'absolute',
  },
  text: {
    color: Colors.text,
    fontWeight: '700',
  },
});
