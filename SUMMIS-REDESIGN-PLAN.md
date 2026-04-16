# Summis Product Redesign Plan

**Date:** March 28, 2026
**Source:** 1000x codebase (backup at `/thousandx/`)
**Direction:** Path D — "The Hybrid" — a phone app that coaches you to use it less

---

## Product Vision

Summis is a science-backed cognitive performance coach that helps knowledge workers implement cognitive hygiene practices — and then proves, with their own data, which practices actually improve their focus and output.

The core insight: smartphones measurably reduce cognitive capacity even when unused (Ward et al., 2017). Summis confronts this honestly. Instead of pretending to be a productivity app that belongs on your phone, it coaches you through the practices that research says matter — including putting your phone away — and uses its correlation engine to prove it worked.

**One-sentence pitch:** "Summis coaches you through science-backed focus practices and proves which ones actually work — with your own data."

**Tagline candidates:** "Prove what works." / "Your focus, measured." / "The science of your best work."

---

## Architecture: What Stays, What Changes, What's New

### Stays (70-80% of codebase)

| Component | Path | Notes |
|---|---|---|
| Expo + React Native framework | Entire project scaffold | SDK 55, Router, TypeScript strict |
| Supabase backend | `lib/supabase.ts`, `lib/data-provider.tsx` | Auth, DB, Edge Functions |
| RevenueCat subscriptions | `lib/revenuecat.ts` | Pricing unchanged for now |
| Zustand store | `store/useAppStore.ts` | Extended, not replaced |
| Correlation engine | `lib/correlation-engine.ts` | Retargeted (see below) |
| Science calculations | `lib/science.ts` | Kept + extended |
| Date utilities | `lib/date-utils.ts` | Unchanged |
| Error boundary + banners | `components/ErrorBoundary.tsx`, `ui/ErrorBanner.tsx` | Unchanged |
| UI primitives | `components/ui/*` | Button, Card, ProgressRing, PaywallModal |
| Notification infrastructure | `lib/notifications.ts`, `lib/ultradian-notifications.ts` | Repurposed |
| Auth flow | `app/(auth)/*` | Unchanged |
| Root layout | `app/_layout.tsx` | Minor updates |
| Performance score hooks | `hooks/usePerformanceScore.ts` | Formula changes |
| Streak logic | `hooks/useStreak.ts`, `lib/science.ts` | Kept for sprint streaks |
| Mock data / demo mode | `lib/mock-data.ts`, `lib/data-provider.tsx` | Updated for new data model |
| Scaffolded services | `lib/onesignal.ts`, `lib/error-logging.ts`, `lib/analytics.ts` | Unchanged |
| Edge Functions | `supabase/functions/*` | Updated prompts/formulas |
| Existing migrations 001-005 | `supabase/migrations/*` | Kept, new ones added |
| Tests infrastructure | `__tests__/*`, Jest config | Tests updated for new models |

### Changes (existing files, modified)

| File | Current Purpose | Summis Purpose |
|---|---|---|
| `app/(tabs)/_layout.tsx` | 6-tab nav (Today, Habits, Journal, Focus, Insights, Profile) | **3-tab nav (Today, Sprint, Score)** + Profile as header icon |
| `app/(tabs)/index.tsx` | Dashboard with stats, habit list, FAB | **Today tab**: MITs, next sprint time, hygiene compliance score, sprint schedule |
| `app/(tabs)/focus.tsx` | Pomodoro timer (25/45/90 min, 5 types) | **Sprint tab**: Yousef protocol sprint (write intention → timer → rest → reflect) |
| `app/(tabs)/insights.tsx` | Performance analytics (charts, reports) | **Score tab**: Cognitive performance trends + correlation insights |
| `app/(tabs)/profile.tsx` | Settings, subscription | Simplified settings + cognitive hygiene config access |
| `app/onboarding.tsx` | Goal quiz (focus/sleep/fitness/general) | **Cognitive Hygiene Setup** (notification audit, phone placement, peak window, sprint schedule) |
| `lib/features.ts` | Habit-based feature flags | Sprint/hygiene-based feature flags |
| `lib/correlation-engine.ts` | Habit completion × overall score | **Hygiene practice completion × focus quality** |
| `types/index.ts` | Habit/Journal/FocusSession types | New types added (see below) |
| `store/useAppStore.ts` | Habits-centric store | Sprints + MITs + hygiene practices centric |
| `lib/mock-data.ts` | 3 habits, 4 journals, 6 sessions | 3 MITs, 5 hygiene practices, 4 sprints |
| `app.json` | "1000x" / "com.thousandx.app" | **"Summis" / "com.summis.app"** |
| `package.json` | name: "thousandx" | **name: "summis"** |
| `constants/Colors.ts` | Dark theme palette | May refine accent colors for Summis brand |
| `components/insights/CorrelationCard.tsx` | Habit × performance card | **Hygiene practice × focus quality card** |
| `components/insights/WeeklyReport.tsx` | Weekly habit/focus summary | Weekly cognitive performance summary |
| `components/insights/PerformanceChart.tsx` | Habit completion bars | Sprint quality + hygiene compliance bars |

### Removed

| File | Reason |
|---|---|
| `app/(tabs)/habits.tsx` | Replaced by MITs in Today tab |
| `app/(tabs)/journal.tsx` | Replaced by 10-second post-sprint reflection |
| `components/habits/HabitCard.tsx` | No longer tracking general habits |
| `components/habits/StreakRing.tsx` | Sprint streaks handled differently |
| `components/habits/HabitForm.tsx` | Replaced by MIT entry + hygiene practice config |
| `components/journal/JournalEntry.tsx` | Journal removed |
| `components/onboarding/GoalQuiz.tsx` | Replaced by CognitiveHygieneSetup |
| `components/onboarding/HabitPreloader.tsx` | Replaced by default hygiene practices |
| `lib/journal-export.ts` | No journal to export |
| `components/social/StreakShareCard.tsx` | May reintroduce later for sprint milestones |
| `lib/streak-milestones.ts` | May reintroduce later |

### New Files

| File | Purpose |
|---|---|
| `types/summis.ts` | New Summis-specific types (see Type Definitions below) |
| `app/(tabs)/sprint.tsx` | Sprint tab — the core interaction screen |
| `app/(tabs)/score.tsx` | Score tab — performance trends + correlations |
| `components/onboarding/CognitiveHygieneSetup.tsx` | Multi-step onboarding: notification audit, phone placement, peak windows, sprint schedule |
| `components/onboarding/NotificationAudit.tsx` | Step 1: Review and disable non-essential notifications |
| `components/onboarding/PhonePlacement.tsx` | Step 2: Commitment to phone-away during sprints |
| `components/onboarding/PeakWindowConfig.tsx` | Step 3: Configure peak energy windows based on chronotype |
| `components/onboarding/SprintScheduleConfig.tsx` | Step 4: Set daily sprint schedule |
| `components/sprint/SprintIntention.tsx` | Pre-sprint: write what you'll accomplish |
| `components/sprint/SprintTimer.tsx` | The timer itself (refactored from focus.tsx) |
| `components/sprint/SprintReflection.tsx` | Post-sprint: 10-second quality rating + reflection |
| `components/sprint/SprintRest.tsx` | Rest period between sprints (guided genuine rest) |
| `components/today/MITCard.tsx` | Single MIT display with time estimate + completion |
| `components/today/MITEntry.tsx` | Add/edit an MIT for today |
| `components/today/HygieneScoreCard.tsx` | Today's cognitive hygiene compliance score |
| `components/today/SprintScheduleCard.tsx` | Upcoming sprints for today |
| `components/score/CognitivePerformanceChart.tsx` | 7-day and 30-day rolling average trends |
| `components/score/HygieneCorrelationCard.tsx` | "Phone away → 23% higher focus" cards |
| `components/score/TrendLabel.tsx` | Rising/Plateau/Declining indicator |
| `hooks/useSprints.ts` | Sprint CRUD, start/pause/complete, streak tracking |
| `hooks/useMITs.ts` | Daily MIT management (max 3 per day) |
| `hooks/useHygieneScore.ts` | Compute daily hygiene compliance score |
| `hooks/useCognitiveScore.ts` | Extended performance score with hygiene weighting |
| `lib/hygiene-engine.ts` | Cognitive hygiene practice definitions, compliance scoring |
| `lib/sprint-protocol.ts` | Yousef sprint protocol logic (intention → focus → rest → reflect) |
| `lib/dnd-integration.ts` | iOS Focus Mode / Android DND API integration |
| `supabase/migrations/006_summis_redesign.sql` | New tables: sprints, mits, hygiene_practices, hygiene_logs |

---

## New Type Definitions

**File: `types/summis.ts`**

```typescript
// ── Cognitive Hygiene ──

export type HygienePractice =
  | 'phone_away'           // Phone in another room during sprints
  | 'notifications_off'    // Non-essential notifications disabled
  | 'dnd_active'          // Do Not Disturb enabled during sprints
  | 'grayscale'           // Phone in grayscale mode
  | 'environment_clear'   // Workspace cleared of visual distractions
  | 'same_stimuli'        // Consistent focus environment (music, tea, location)
  | 'no_email'            // Email/chat closed during sprints
  | 'custom';             // User-defined practice

export interface HygieneConfig {
  id: string;
  user_id: string;
  practice: HygienePractice;
  label: string;                    // Display name
  description: string | null;       // Science note
  is_active: boolean;               // User has this practice enabled
  created_at: string;
}

export interface HygieneLog {
  id: string;
  user_id: string;
  practice: HygienePractice;
  date: string;                     // Date of compliance
  compliant: boolean;               // Did user follow the practice today?
  sprint_id: string | null;         // Linked to specific sprint, if applicable
  logged_at: string;
}

// ── MITs (Most Important Tasks) ──

export interface MIT {
  id: string;
  user_id: string;
  date: string;                     // The day this MIT is for
  title: string;
  estimated_minutes: number;        // User's time estimate
  actual_minutes: number | null;    // Filled after completion
  completed: boolean;
  completed_at: string | null;
  sort_order: number;               // 1, 2, or 3 (max 3 MITs per day)
  sprint_id: string | null;         // Linked sprint, if any
  created_at: string;
}

// ── Sprints (replaces FocusSession) ──

export type SprintPhase = 'intention' | 'focus' | 'rest' | 'reflection';

export interface Sprint {
  id: string;
  user_id: string;
  date: string;
  intention: string;                // What the user plans to accomplish
  duration_minutes: number;         // 30, 45, or 50 (Yousef protocol)
  phase: SprintPhase;               // Current phase of the sprint
  started_at: string;
  ended_at: string | null;
  completed: boolean;

  // Pre-sprint hygiene check
  phone_away: boolean;              // Confirmed phone is away
  dnd_enabled: boolean;             // DND was activated
  environment_ready: boolean;       // Workspace prepped

  // Post-sprint reflection
  focus_quality: number | null;     // 1-5 self-reported focus rating
  intention_met: boolean | null;    // Did they accomplish the intention?
  reflection_note: string | null;   // Optional 1-sentence reflection
  interruptions: number;
  interruption_types: string[];     // Phone, Person, Thought, Other

  // Linked MIT
  mit_id: string | null;
}

// ── Cognitive Performance Score ──

export interface CognitiveScore {
  date: string;
  overallScore: number;            // Weighted composite
  sprintScore: number;             // Sprint completion × quality
  hygieneScore: number;            // Hygiene compliance rate
  consistencyScore: number;        // Days with sprints / total days
  focusQuality: number;            // Average self-reported focus (1-5 → 0-100)
}

// ── Hygiene Correlation (extends existing correlation engine) ──

export interface HygieneCorrelation {
  practice: HygienePractice;
  practiceLabel: string;
  complianceRate: number;           // 0-1
  correlation: number;              // Pearson r vs focus quality
  sampleSize: number;
  isSignificant: boolean;
  direction: 'positive' | 'negative' | 'none';
  strengthLabel: 'strong' | 'moderate' | 'weak';
  insightText: string;              // "Focus is 23% higher on days you keep your phone away"
}

// ── Updated Profile ──

export interface SummisProfile extends Omit<Profile, 'user_goal'> {
  user_goal: 'focus' | 'performance' | 'balance' | null;  // Simplified goals
  sprint_duration_preference: 30 | 45 | 50;               // Default sprint length
  peak_window_start: string | null;                        // e.g., "09:00"
  peak_window_end: string | null;                          // e.g., "12:00"
  afternoon_window_start: string | null;                   // Secondary peak
  afternoon_window_end: string | null;
  daily_sprint_target: number;                             // Target sprints per day (default: 3)
  phone_placement_commitment: 'other_room' | 'drawer' | 'face_down' | null;
  notification_audit_completed: boolean;
  hygiene_setup_completed: boolean;
}
```

---

## Tab Structure: 3 Tabs + Profile

### Tab 1: Today (index.tsx)

The daily command center. Minimal, focused, designed for a 30-second morning check-in.

**Layout (top to bottom):**
1. **Greeting + Date** — "Good morning, Ramakrishna" with current date
2. **Cognitive Hygiene Score** — Today's compliance as a ring (0-100). Tapping opens hygiene detail.
3. **MITs Section** — 3 slots for Most Important Tasks. Each shows title, estimated time, completion checkbox. Empty slots show "Add MIT" placeholder. Tapping a completed MIT shows actual vs estimated time.
4. **Next Sprint Card** — Shows time until next scheduled sprint, or "Start Sprint" button if within a peak window. Shows which MIT it's linked to.
5. **Sprint History** — Today's completed sprints as small cards (intention, duration, focus quality rating).
6. **Evening Reflection** — Appears after 6 PM. Day rating (1-5), optional one-sentence note.

**Data needed:** MITs for today, hygiene logs for today, sprints for today, peak window schedule.

**Interaction model:** Morning check-in (set MITs, confirm hygiene) → sprints during peak windows → evening reflection. Total daily app time target: under 5 minutes.

### Tab 2: Sprint (sprint.tsx)

The core interaction. A 4-phase guided experience based on Yousef's focus sprint protocol.

**Phase 1 — Intention (pre-sprint, 30 seconds):**
- Write exactly what you'll accomplish in this sprint
- Select linked MIT (optional)
- Confirm hygiene checklist: phone away? DND on? Environment clear?
- "Begin Sprint" button

**Phase 2 — Focus (the sprint itself, 30/45/50 minutes):**
- Large countdown timer (dominant screen element)
- Intention displayed at top as reminder
- Minimal UI — no stats, no navigation, no distractions
- Pause button (triggers interruption logger from existing InterruptionLogger.tsx)
- Background: app triggers DND via iOS Focus API / Android DND

**Phase 3 — Rest (post-sprint, 5-10 minutes):**
- "Take a real break" screen
- Suggestions: walk, stretch, look out window, get water
- NOT: check phone, scroll social media, check email
- Gentle timer showing rest duration
- "Ready for next sprint" button

**Phase 4 — Reflection (10 seconds):**
- Focus quality rating (1-5 stars or slider)
- "Did you accomplish your intention?" (Yes/Partially/No)
- Optional one-sentence note
- "Done" button → returns to Today tab with updated data

**Design principle:** The sprint screen should feel like entering a focused environment. Transition animation (screen dims, reduces to essentials). The app is most useful when it's NOT being looked at.

### Tab 3: Score (score.tsx)

Performance trends and the correlation engine payoff. This is where users see the proof.

**Layout (top to bottom):**
1. **Performance Header** — Current 7-day rolling average score + delta vs. last week. Trend label (Rising/Plateau/Declining).
2. **Trend Chart** — 30-day chart with two lines: 7-day rolling average (primary, colored) and 30-day rolling average (secondary, gray). Daily dots plotted underneath.
3. **Hygiene Correlation Cards** (Pro-gated after 30 days) — Top 3 significant correlations. Each card: practice name, compliance rate bar, natural language insight ("Your focus is 23% higher on days you keep your phone in another room"), strength badge.
4. **Sprint Quality Breakdown** — Average focus quality by time of day, showing peak window effectiveness.
5. **Weekly Summary Card** — Sprints completed, total focus time, average quality, MIT completion rate, hygiene compliance.

**Paywall trigger:** After 30 days of data, blurred correlation cards appear: "We found 3 cognitive hygiene practices strongly linked to your focus performance. Upgrade to see your results." This is the most compelling paywall in the app — users have invested 30 days and the insights are personalized.

### Profile (accessed via header icon, not a tab)

- Account settings (name, email, sign out)
- Cognitive hygiene configuration (re-run notification audit, change phone placement, adjust peak windows)
- Sprint preferences (default duration, daily target)
- Subscription management
- Science protocols library (kept from 1000x, with Summis framing)
- About / privacy policy

---

## New Performance Score Formula

**Summis Cognitive Score (replaces 1000x Performance Score):**

| Component | Weight | Calculation |
|---|---|---|
| Sprint completion | 30% | Completed sprints / target sprints for the day |
| Focus quality | 30% | Average self-reported focus rating (1-5 → 0-100) |
| Hygiene compliance | 25% | Active practices followed / active practices total |
| MIT completion | 15% | MITs completed / MITs set |

**Why this weighting:** Sprint completion and focus quality are the outcomes — they get the most weight. Hygiene compliance is the input — it's what the correlation engine measures against. MIT completion is a secondary signal of productive output.

---

## Correlation Engine Retargeting

The existing Pearson correlation engine in `lib/correlation-engine.ts` stays, but the vectors change:

**Before (1000x):**
- X vector: Binary habit completion (did/didn't complete "Meditate")
- Y vector: Daily overall score

**After (Summis):**
- X vector: Binary hygiene compliance (did/didn't keep phone away)
- Y vector: Daily focus quality score (average sprint focus rating for that day)

The engine computes correlations for each active hygiene practice against focus quality. The insight text changes from "On days you complete Meditate, your score is 18% higher" to "Your focus is 23% higher on days you keep your phone in another room."

This is a tighter, more actionable loop. The practices are specific environmental changes (not vague habits), and the outcome is directly measured (self-reported focus quality during sprints, not a composite score).

---

## Onboarding: Cognitive Hygiene Setup

Replaces the 4-question goal quiz. This is a guided setup that takes 2-3 minutes and configures the user's cognitive environment.

**Step 1 — Welcome + Philosophy (10 seconds)**
Brief explanation: "Summis helps you build a focused work environment and proves what works with your own data. Let's set up your cognitive hygiene baseline."

**Step 2 — Chronotype + Peak Windows (30 seconds)**
- When do you typically wake up? (time picker)
- Auto-calculates peak performance windows:
  - Morning peak: wake + 2.5-3 hours (90-min window)
  - Afternoon peak: wake + 8-9 hours (90-min window)
- User can adjust these manually

**Step 3 — Notification Audit (60 seconds)**
- "Notifications are the #1 reason phones capture your attention" (Yousef)
- Checklist of common notification categories: Social media, Email, News, Shopping, Entertainment
- For each: recommend "disable" with toggle
- VIP contacts: suggest enabling only for key people
- Link to system notification settings

**Step 4 — Phone Placement Commitment (20 seconds)**
- "Research shows that even a silent phone on your desk reduces your working memory" (Ward et al.)
- Choose your commitment: Other room (recommended), In a drawer, Face down on desk
- This choice feeds into the pre-sprint hygiene checklist

**Step 5 — Sprint Schedule (30 seconds)**
- Default: 3 sprints per day during peak windows
- Sprint duration: 30 / 45 / 50 minutes (default: 45)
- Preview: "Your sprint schedule: 9:30 AM, 10:30 AM, 2:30 PM"

**Step 6 — Ready Screen**
- Summary of setup
- "Your first sprint is scheduled for [time]. We'll remind you 10 minutes before."
- "Start using Summis" button

---

## Feature Flags (Updated)

```typescript
export const FEATURES = {
  // Free tier
  daily_sprints: 3,              // Max 3 sprints per day (free)
  mits: true,                    // MITs always available
  basic_hygiene: true,           // 3 core practices (phone away, DND, notifications)
  sprint_timer: true,            // Full sprint experience
  basic_score: true,             // Current week score + delta

  // Pro tier
  sprints_unlimited: 'pro',      // Unlimited sprints
  correlation_insights: 'pro',   // Hygiene × focus correlations
  trend_analysis: 'pro',         // 30-day trends, rolling averages
  ai_insights: 'pro',            // AI-generated insights
  custom_hygiene: 'pro',         // Add custom hygiene practices
  advanced_analytics: 'pro',     // Sprint quality by time of day, etc.
  science_protocols: 'pro',      // Full science library
  data_export: 'pro',            // Export sprint/score data
} as const;
```

**Free tier rationale:** 3 sprints/day is enough to prove value. The timer, MIT setting, and basic hygiene tracking are free — the user builds the habit. At 30 days, the blurred correlation cards create the strongest possible conversion moment.

**Paywall trigger points (updated):**
1. **30-day correlation cards** — Blurred cards appear showing personalized insights. This is the primary conversion trigger.
2. After completing 50 total sprints — "Unlock unlimited sprints"
3. User taps "AI Insights"
4. User taps trend analysis or advanced charts
5. User tries to add custom hygiene practice beyond the 3 defaults

---

## Database Migration: 006_summis_redesign.sql

```sql
-- New table: sprints (replaces focus_sessions for Summis flow)
create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  intention text not null,
  duration_minutes int not null default 45,
  started_at timestamptz not null,
  ended_at timestamptz,
  completed boolean default false,

  -- Pre-sprint hygiene
  phone_away boolean default false,
  dnd_enabled boolean default false,
  environment_ready boolean default false,

  -- Post-sprint reflection
  focus_quality int check (focus_quality between 1 and 5),
  intention_met text check (intention_met in ('yes', 'partially', 'no')),
  reflection_note text,
  interruptions int default 0,
  interruption_types text[] default '{}',

  -- Linked MIT
  mit_id uuid references public.mits(id) on delete set null,

  created_at timestamptz default now()
);

alter table public.sprints enable row level security;
create policy "Users own sprints" on public.sprints for all using (auth.uid() = user_id);
create index on public.sprints (user_id, date desc);

-- New table: mits (Most Important Tasks)
create table public.mits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  title text not null,
  estimated_minutes int not null,
  actual_minutes int,
  completed boolean default false,
  completed_at timestamptz,
  sort_order int default 1,
  sprint_id uuid references public.sprints(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.mits enable row level security;
create policy "Users own mits" on public.mits for all using (auth.uid() = user_id);
create index on public.mits (user_id, date desc);

-- New table: hygiene_configs (user's active practices)
create table public.hygiene_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  practice text not null,
  label text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, practice)
);

alter table public.hygiene_configs enable row level security;
create policy "Users own hygiene configs" on public.hygiene_configs for all using (auth.uid() = user_id);

-- New table: hygiene_logs (daily compliance tracking)
create table public.hygiene_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  practice text not null,
  date date not null,
  compliant boolean not null,
  sprint_id uuid references public.sprints(id) on delete set null,
  logged_at timestamptz default now(),
  unique(user_id, practice, date)
);

alter table public.hygiene_logs enable row level security;
create policy "Users own hygiene logs" on public.hygiene_logs for all using (auth.uid() = user_id);
create index on public.hygiene_logs (user_id, date desc);

-- Profile extensions for Summis
alter table public.profiles add column if not exists sprint_duration_preference int default 45;
alter table public.profiles add column if not exists peak_window_start time;
alter table public.profiles add column if not exists peak_window_end time;
alter table public.profiles add column if not exists afternoon_window_start time;
alter table public.profiles add column if not exists afternoon_window_end time;
alter table public.profiles add column if not exists daily_sprint_target int default 3;
alter table public.profiles add column if not exists phone_placement_commitment text;
alter table public.profiles add column if not exists notification_audit_completed boolean default false;
alter table public.profiles add column if not exists hygiene_setup_completed boolean default false;
```

---

## Implementation Phases

### Phase 1: Identity + Structure ✅
- [x] Update `app.json` — name, slug, scheme, bundle IDs, health description
- [x] Update `package.json` — name, store key name
- [x] Update `CLAUDE.md` — full rewrite for Summis
- [x] Create `types/summis.ts` with all new type definitions
- [x] Write migration `015_summis_redesign.sql`
- [x] Restructure tabs: `_layout.tsx` → 3 tabs + profile icon
- [x] Rename/create tab files: `index.tsx` (Today), `sprint.tsx`, `score.tsx`
- [x] Remove `habits.tsx`, `journal.tsx` tab files (hidden via href: null)
- [x] Update store to add sprints, MITs, hygiene state
- [x] Create `hooks/useCognitiveScore.ts` — weighted score formula
- [x] Wire `deleteMIT` to data provider

### Phase 2: Core Sprint Experience ✅
- [x] Build `SprintIntention.tsx` — pre-sprint intention + hygiene checklist + MIT linking
- [x] Refactor focus timer into `SprintTimer.tsx` — clean, minimal countdown
- [x] Build `SprintRest.tsx` — guided rest with suggestions
- [x] Build `SprintReflection.tsx` — 10-second quality rating + intention review
- [x] Build `sprint.tsx` tab — orchestrates the 4-phase flow
- [x] Create `hooks/useSprints.ts` — Sprint CRUD + phase management
- [x] Create `lib/sprint-protocol.ts` — Sprint phase logic, duration management
- [x] Load sprints + MITs + hygiene data on app init (`_layout.tsx`)
- [x] Persist hygiene configs in onboarding
- [x] Add MIT linking to sprint intention
- [x] Add active sprint recovery on app reopen

### Phase 3: Today Tab + MITs ✅
- [x] Build `MITCard.tsx` and `MITEntry.tsx` components
- [x] Build `HygieneScoreCard.tsx` — today's compliance ring
- [x] Build `SprintScheduleCard.tsx` — upcoming sprints
- [x] Redesign `index.tsx` (Today tab) layout
- [x] Create `hooks/useMITs.ts` — MIT CRUD, max 3 per day
- [x] Create `hooks/useHygieneScore.ts` — daily compliance computation
- [x] Add hygiene log checkboxes to Today tab (expandable from score card)
- [x] Add evening reflection form (after 6 PM: day rating 1-5 + note)

### Phase 4: Cognitive Hygiene Onboarding ✅
- [x] Build `CognitiveHygieneSetup.tsx` — 7-step onboarding flow
- [x] Add notification audit step with category checklist + system settings link
- [x] Build phone placement commitment step
- [x] Build energy preview + custom wake time selector
- [x] Build sprint schedule config step
- [x] Update `onboarding.tsx` — saves all profile fields to backend
- [x] Create `lib/hygiene-engine.ts` — practice definitions, default setup
- [x] Add back navigation to all onboarding steps

### Phase 5: Score Tab + Correlation Engine ✅
- [x] Build `CognitivePerformanceChart.tsx` — 30-day trend with rolling average lines
- [x] Build `HygieneCorrelationCard.tsx` — practice × focus quality cards
- [x] Build `TrendLabel.tsx` — Rising/Plateau/Declining
- [x] Update `correlation-engine.ts` — retarget to hygiene × focus quality
- [x] Create `hooks/useHygieneCorrelations.ts` — wires correlation engine to Score tab
- [x] Redesign `score.tsx` (Score tab) layout with correlations + time-of-day breakdown
- [x] Create `hooks/useCognitiveScore.ts` — new performance formula
- [x] Update paywall to trigger on 30-day correlation cards

### Phase 6: DND Integration + Polish ✅
- [x] Create `lib/dnd-integration.ts` — iOS Focus API + Android DND (scaffolded, wired into sprint flow)
- [x] Wire notifications into onboarding (energy phase alerts, morning prime)
- [x] Wire streak reminders into sprint completion
- [x] Update mock data for demo mode
- [x] Write new tests for hygiene correlations (9 tests)
- [x] Fix performance-score Edge Function (fetch daily_sprint_target from profile)
- [x] Add Ward et al. protocol to science-protocols.ts

### Phase 7: Store Preparation ✅ (code complete, external setup pending)
- [x] App icon and splash screen for Summis brand
- [x] Store copy: description, keywords, feature highlights
- [x] EAS config with all env var placeholders
- [x] Pre-submission smoke test checklist
- [ ] App Store screenshots (requires device testing)
- [ ] TestFlight beta deployment (requires Apple developer account)
- [ ] Production Supabase setup (requires account creation)
- [ ] RevenueCat product configuration (requires account creation)

---

## Key Design Principles

1. **Subtractive, not additive.** The app should ask users to do fewer things, not more. Every screen should earn its place.

2. **Under 5 minutes daily.** Total app interaction time target. Morning MITs (30s), sprint start/stop (20s each), evening reflection (30s). The app succeeds when users aren't using it.

3. **The phone is the problem.** Every design decision should acknowledge this. The sprint screen should make you want to put the phone down. The DND integration should automate phone silencing. The correlation engine should literally prove that phone-away days produce better focus.

4. **Prove, don't claim.** Never say "meditation improves focus." Say "on the 18 days you meditated before sprints, your focus rating was 23% higher." Personalized data beats generic science claims.

5. **Honest about limitations.** Correlation, not causation. Sample sizes displayed. Confidence levels visible. The target audience respects intellectual honesty — overclaiming destroys trust.

---

## Competitive Moat

The correlation engine is the moat. Competitors in the digital wellness space (Opal, Freedom, ScreenZen, one sec, Forest) all measure inputs: how much you reduced screen time. None of them measure outputs: did reducing screen time actually make you more productive?

Summis closes this loop. It measures both the environmental change (cognitive hygiene compliance) and the cognitive outcome (sprint focus quality), then connects them with statistical rigor. After 30 days, a Summis user doesn't just believe they should put their phone away — they have personalized proof that it works, measured in their own data.

That proof is the product. That proof is the paywall. And that proof is what no competitor offers.
