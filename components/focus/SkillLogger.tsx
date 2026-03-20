import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

interface SkillLoggerProps {
  visible: boolean;
  onLog: (data: { skillName: string; weakness: string; progress: number }) => void;
  onDismiss: () => void;
}

export function SkillLogger({ visible, onLog, onDismiss }: SkillLoggerProps) {
  const [skillName, setSkillName] = useState('');
  const [weakness, setWeakness] = useState('');
  const [progress, setProgress] = useState(3);

  function handleSubmit() {
    if (!skillName.trim()) return;
    onLog({
      skillName: skillName.trim(),
      weakness: weakness.trim(),
      progress,
    });
    setSkillName('');
    setWeakness('');
    setProgress(3);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Log Practice Session</Text>
          <Text style={styles.subtitle}>Track your deliberate practice for spaced review</Text>

          <Text style={styles.label}>What skill did you practice?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. React Native, Piano, Spanish"
            placeholderTextColor={Colors.textSecondary}
            value={skillName}
            onChangeText={setSkillName}
            accessibilityLabel="Skill name"
          />

          <Text style={styles.label}>What weakness did you target?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. State management, Chord transitions"
            placeholderTextColor={Colors.textSecondary}
            value={weakness}
            onChangeText={setWeakness}
            accessibilityLabel="Weakness targeted"
          />

          <Text style={styles.label}>Progress rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.ratingBtn, progress === v && styles.ratingActive]}
                onPress={() => setProgress(v)}
                accessibilityLabel={`Progress ${v}`}
              >
                <Text style={[styles.ratingText, progress === v && styles.ratingTextActive]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>1 = struggled, 5 = breakthrough</Text>

          <View style={styles.buttons}>
            <Button title="Skip" onPress={onDismiss} variant="secondary" style={styles.btn} />
            <Button
              title="Save"
              onPress={handleSubmit}
              disabled={!skillName.trim()}
              style={styles.btn}
            />
          </View>
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
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingTextActive: {
    color: Colors.accent,
  },
  ratingHint: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});
