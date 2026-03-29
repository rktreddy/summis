import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { SPRINT_DURATIONS, DEFAULT_SPRINT_DURATION } from '@/lib/sprint-protocol';
import {
  CHRONOTYPE_DEFINITIONS,
  ENERGY_PHASE_INFO,
  computeChronotypeProfile,
  computeEnergyWindows,
} from '@/lib/chronotype-engine';
import type { SprintDuration, PhonePlacement, OnboardingConfig, ChronotypeCategory } from '@/types/summis';

interface CognitiveHygieneSetupProps {
  onComplete: (config: OnboardingConfig) => void;
}

type Step = 'welcome' | 'chronotype' | 'energy_preview' | 'phone' | 'sprint' | 'ready';

const PHONE_OPTIONS: { key: PhonePlacement; label: string; desc: string }[] = [
  { key: 'other_room', label: 'Another Room', desc: 'Highest impact — recommended' },
  { key: 'drawer', label: 'In a Drawer', desc: 'Out of sight, still nearby' },
  { key: 'face_down', label: 'Face Down on Desk', desc: 'Minimum effective distance' },
];

export function CognitiveHygieneSetup({ onComplete }: CognitiveHygieneSetupProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [chronotype, setChronotype] = useState<ChronotypeCategory>('bi_phasic');
  const [phonePlacement, setPhonePlacement] = useState<PhonePlacement>('other_room');
  const [sprintDuration, setSprintDuration] = useState<SprintDuration>(DEFAULT_SPRINT_DURATION);
  const [dailyTarget, setDailyTarget] = useState(3);

  const ctDef = CHRONOTYPE_DEFINITIONS.find((d) => d.key === chronotype)!;
  const profile = computeChronotypeProfile(chronotype, ctDef.wakeTimeDefault);
  const energyWindows = computeEnergyWindows(chronotype, ctDef.wakeTimeDefault);

  function handleComplete() {
    const dipWindow = energyWindows.find((w) => w.phase === 'dip');
    onComplete({
      chronotype,
      wakeTime: ctDef.wakeTimeDefault,
      peakWindowStart: profile.peakWindowStart,
      peakWindowEnd: profile.peakWindowEnd,
      afternoonWindowStart: dipWindow?.startTime ?? profile.peakWindowEnd,
      afternoonWindowEnd: dipWindow?.endTime ?? profile.peakWindowEnd,
      sprintDuration,
      dailySprintTarget: dailyTarget,
      phonePlacement,
      notificationAuditCompleted: true,
      energyWindows,
      caffeineEarliest: profile.caffeineEarliest,
      caffeineCutoff: profile.caffeineCutoff,
    });
  }

  const steps: Step[] = ['welcome', 'chronotype', 'energy_preview', 'phone', 'sprint', 'ready'];
  const currentIndex = steps.indexOf(step);
  const progress = (currentIndex + 1) / steps.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        {step === 'welcome' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Welcome to Summis</Text>
            <Text style={styles.stepText}>
              Summis helps you build a focused work environment and proves which practices actually improve your cognitive performance — with your own data.
            </Text>
            <Text style={styles.stepText}>
              Let's set up your cognitive profile. This takes about 2 minutes.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button title="Let's go" onPress={() => setStep('chronotype')} />
            </View>
          </View>
        )}

        {/* Chronotype Selection */}
        {step === 'chronotype' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
            <Text style={styles.stepTitle}>What's your chronotype?</Text>
            <Text style={styles.stepText}>
              Your chronotype is your biological energy pattern — it determines when your brain is naturally sharpest and when it needs rest.
            </Text>
            <View style={styles.optionList}>
              {CHRONOTYPE_DEFINITIONS.map((ct) => (
                <TouchableOpacity
                  key={ct.key}
                  style={[styles.option, chronotype === ct.key && styles.optionActive]}
                  onPress={() => setChronotype(ct.key)}
                  accessibilityLabel={ct.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: chronotype === ct.key }}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name={ct.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={chronotype === ct.key ? Colors.accent : Colors.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, chronotype === ct.key && styles.optionTitleActive]}>
                        {ct.label}
                      </Text>
                      <Text style={styles.optionPopulation}>{ct.population}</Text>
                    </View>
                  </View>
                  <Text style={styles.optionDesc}>{ct.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <Button title="Next" onPress={() => setStep('energy_preview')} />
            </View>
          </View>
        )}

        {/* Energy Phase Preview */}
        {step === 'energy_preview' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
            <Text style={styles.stepTitle}>Your energy pattern</Text>
            <Text style={styles.stepText}>
              Based on your {ctDef.label} chronotype, here are your daily energy phases. Summis will use these to coach you on when to sprint and what type of work to do.
            </Text>

            <View style={styles.energyPhaseList}>
              {energyWindows.map((w, i) => {
                const info = ENERGY_PHASE_INFO[w.phase];
                return (
                  <View key={`${w.phase}-${i}`} style={styles.energyPhaseCard}>
                    <View style={[styles.phaseIndicator, { backgroundColor: info.color }]} />
                    <View style={styles.phaseContent}>
                      <View style={styles.phaseHeaderRow}>
                        <Text style={[styles.phaseLabel, { color: info.color }]}>{info.label}</Text>
                        <Text style={styles.phaseTime}>{w.startTime} — {w.endTime}</Text>
                      </View>
                      <Text style={styles.phaseWorkType}>{info.workType}</Text>
                      <Text style={styles.phaseDesc}>{info.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Caffeine timing card */}
            <View style={styles.tipCard}>
              <Ionicons name="cafe-outline" size={18} color={Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Caffeine window</Text>
                <Text style={styles.tipText}>
                  Earliest: {profile.caffeineEarliest} (90 min after waking){'\n'}
                  Cutoff: {profile.caffeineCutoff} (8h before sleep)
                </Text>
              </View>
            </View>

            {/* Nap window card */}
            {profile.napWindow && (
              <View style={styles.tipCard}>
                <Ionicons name="bed-outline" size={18} color={Colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Nap window</Text>
                  <Text style={styles.tipText}>
                    During your dip ({profile.napWindow.startTime} — {profile.napWindow.endTime}){'\n'}
                    20 min or 90 min only — nothing in between.
                  </Text>
                </View>
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Button title="Next" onPress={() => setStep('phone')} />
            </View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('chronotype')}
              accessibilityLabel="Go back to chronotype selection"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phone Placement */}
        {step === 'phone' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
            <Text style={styles.stepTitle}>Where will your phone go?</Text>
            <Text style={styles.stepText}>
              Research shows that even a silent, face-down phone on your desk reduces your working memory and fluid intelligence (Ward et al., 2017).
            </Text>
            <View style={styles.optionList}>
              {PHONE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.option, phonePlacement === opt.key && styles.optionActive]}
                  onPress={() => setPhonePlacement(opt.key)}
                  accessibilityLabel={opt.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: phonePlacement === opt.key }}
                >
                  <Text style={[styles.optionTitle, phonePlacement === opt.key && styles.optionTitleActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <Button title="Next" onPress={() => setStep('sprint')} />
            </View>
          </View>
        )}

        {/* Sprint Config */}
        {step === 'sprint' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>STEP 4 OF 4</Text>
            <Text style={styles.stepTitle}>Set your sprint schedule</Text>
            <Text style={styles.stepText}>
              A focus sprint is a timed block of deep work with a clear intention. Based on Dr. Yousef's protocol: set intention, focus, rest, reflect.
            </Text>

            <Text style={styles.subLabel}>Sprint duration</Text>
            <View style={styles.optionList}>
              {SPRINT_DURATIONS.map((sd) => (
                <TouchableOpacity
                  key={sd.minutes}
                  style={[styles.option, sprintDuration === sd.minutes && styles.optionActive]}
                  onPress={() => setSprintDuration(sd.minutes)}
                  accessibilityLabel={sd.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: sprintDuration === sd.minutes }}
                >
                  <Text style={[styles.optionTitle, sprintDuration === sd.minutes && styles.optionTitleActive]}>
                    {sd.label}
                  </Text>
                  <Text style={styles.optionDesc}>{sd.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subLabel}>Daily target</Text>
            <View style={styles.targetRow}>
              {[2, 3, 4].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.targetBtn, dailyTarget === t && styles.targetBtnActive]}
                  onPress={() => setDailyTarget(t)}
                  accessibilityLabel={`${t} sprints per day`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: dailyTarget === t }}
                >
                  <Text style={[styles.targetText, dailyTarget === t && styles.targetTextActive]}>
                    {t} sprints
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <Button title="Next" onPress={() => setStep('ready')} />
            </View>
          </View>
        )}

        {/* Ready */}
        {step === 'ready' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>You're all set</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name={ctDef.icon as keyof typeof Ionicons.glyphMap} size={16} color={Colors.accent} />
                <Text style={styles.summaryItem}>
                  Chronotype: {ctDef.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="flash-outline" size={16} color="#4CAF50" />
                <Text style={styles.summaryItem}>
                  Peak: {profile.peakWindowStart} — {profile.peakWindowEnd}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cafe-outline" size={16} color={Colors.warning} />
                <Text style={styles.summaryItem}>
                  Caffeine: {profile.caffeineEarliest} — {profile.caffeineCutoff}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="phone-portrait-outline" size={16} color={Colors.accent} />
                <Text style={styles.summaryItem}>
                  Phone: {PHONE_OPTIONS.find((p) => p.key === phonePlacement)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="timer-outline" size={16} color={Colors.accent} />
                <Text style={styles.summaryItem}>
                  Sprint: {sprintDuration} min, {dailyTarget}x daily
                </Text>
              </View>
            </View>
            <Text style={styles.stepText}>
              We'll remind you before your peak focus window. Your first sprint is waiting.
            </Text>
            <Text style={styles.attribution}>
              Chronotype framework based on Dr. Sahar Yousef's curriculum at UC Berkeley Haas, grounded in peer-reviewed chronobiology research (Horne & Östberg, 1976).
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button title="Start using Summis" onPress={handleComplete} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  stepContent: {
    gap: 20,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  stepText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  optionList: {
    gap: 10,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '15',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTitleActive: {
    color: Colors.accent,
  },
  optionPopulation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  optionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Energy Phase cards
  energyPhaseList: {
    gap: 12,
  },
  energyPhaseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phaseIndicator: {
    width: 4,
  },
  phaseContent: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  phaseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  phaseTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  phaseWorkType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  phaseDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Tip cards (caffeine, nap)
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Summary
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryItem: {
    fontSize: 15,
    color: Colors.text,
  },
  // Navigation
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  attribution: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  targetBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  targetText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  targetTextActive: {
    color: Colors.accent,
  },
});
