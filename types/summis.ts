// ── Summis Types ──────────────────────────────────────────────────────
// New types for the Summis cognitive performance coach.
// Legacy types in index.ts are kept for migration compatibility.

import type { Profile } from './index';

// ── Chronotype & Energy Phases ──

export type ChronotypeCategory = 'am_shifted' | 'bi_phasic' | 'pm_shifted';

export type EnergyPhase = 'peak' | 'dip' | 'recovery';

export interface EnergyWindow {
  phase: EnergyPhase;
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  durationHours: number;
}

export interface ChronotypeProfile {
  chronotype: ChronotypeCategory;
  wakeTime: string;
  energyWindows: EnergyWindow[];
  peakWindowStart: string;
  peakWindowEnd: string;
  caffeineEarliest: string;
  caffeineCutoff: string;
  napWindow: {
    startTime: string;
    endTime: string;
    maxMinutes: number;
    note: string;
  } | null;
}

// ── Cognitive Hygiene ──

export type HygienePractice =
  | 'phone_away'
  | 'notifications_off'
  | 'dnd_active'
  | 'grayscale'
  | 'environment_clear'
  | 'same_stimuli'
  | 'no_email'
  | 'custom';

export interface HygieneConfig {
  id: string;
  user_id: string;
  practice: HygienePractice;
  label: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HygieneLog {
  id: string;
  user_id: string;
  practice: HygienePractice;
  date: string;
  compliant: boolean;
  sprint_id: string | null;
  logged_at: string;
}

// ── MITs (Most Important Tasks) ──

export interface MIT {
  id: string;
  user_id: string;
  date: string;
  title: string;
  estimated_minutes: number;
  actual_minutes: number | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  sprint_id: string | null;
  created_at: string;
}

// ── Sprints ──

export type SprintPhase = 'intention' | 'focus' | 'rest' | 'reflection';

export type SprintDuration = 30 | 45 | 50;

export interface Sprint {
  id: string;
  user_id: string;
  date: string;
  intention: string;
  duration_minutes: number;
  phase: SprintPhase;
  started_at: string;
  ended_at: string | null;
  completed: boolean;

  // Pre-sprint hygiene check
  phone_away: boolean;
  dnd_enabled: boolean;
  environment_ready: boolean;

  // Post-sprint reflection
  focus_quality: number | null;
  intention_met: 'yes' | 'partially' | 'no' | null;
  reflection_note: string | null;
  interruptions: number;
  interruption_types: string[];

  // Linked MIT
  mit_id: string | null;
}

// ── Cognitive Performance Score ──

export interface CognitiveScore {
  date: string;
  overallScore: number;
  sprintScore: number;
  hygieneScore: number;
  consistencyScore: number;
  focusQuality: number;
}

// ── Hygiene Correlation ──

export interface HygieneCorrelation {
  practice: HygienePractice;
  practiceLabel: string;
  complianceRate: number;
  correlation: number;
  sampleSize: number;
  isSignificant: boolean;
  direction: 'positive' | 'negative' | 'none';
  strengthLabel: 'strong' | 'moderate' | 'weak';
  highCompleter: boolean;
  lowCompleter: boolean;
  insightText: string;
}

// ── Phone Placement ──

export type PhonePlacement = 'other_room' | 'drawer' | 'face_down';

// ── Summis Profile Extensions ──

export interface SummisProfile extends Profile {
  sprint_duration_preference: SprintDuration;
  peak_window_start: string | null;
  peak_window_end: string | null;
  afternoon_window_start: string | null;
  afternoon_window_end: string | null;
  daily_sprint_target: number;
  phone_placement_commitment: PhonePlacement | null;
  notification_audit_completed: boolean;
  hygiene_setup_completed: boolean;
}

// ── Onboarding ──

export interface OnboardingConfig {
  chronotype: ChronotypeCategory;
  wakeTime: string;
  peakWindowStart: string;
  peakWindowEnd: string;
  afternoonWindowStart: string;
  afternoonWindowEnd: string;
  sprintDuration: SprintDuration;
  dailySprintTarget: number;
  phonePlacement: PhonePlacement;
  notificationAuditCompleted: boolean;
  energyWindows: EnergyWindow[];
  caffeineEarliest: string;
  caffeineCutoff: string;
}
