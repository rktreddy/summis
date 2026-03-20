import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const INTERRUPTION_TYPES = [
  { key: 'phone', emoji: '\uD83D\uDCF1', label: 'Phone' },
  { key: 'person', emoji: '\uD83D\uDE4B', label: 'Person' },
  { key: 'thought', emoji: '\uD83D\uDCAD', label: 'Thought' },
  { key: 'other', emoji: '\u2753', label: 'Other' },
] as const;

interface InterruptionLoggerProps {
  visible: boolean;
  onLog: (type: string) => void;
  onDismiss: () => void;
}

export function InterruptionLogger({ visible, onLog, onDismiss }: InterruptionLoggerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>What interrupted you?</Text>
          <Text style={styles.subtitle}>Tap to log and resume</Text>

          <View style={styles.options}>
            {INTERRUPTION_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={styles.option}
                onPress={() => onLog(t.key)}
                accessibilityLabel={`Interruption: ${t.label}`}
              >
                <Text style={styles.optionEmoji}>{t.emoji}</Text>
                <Text style={styles.optionLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onDismiss}
            accessibilityLabel="Skip logging"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  option: {
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 72,
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
