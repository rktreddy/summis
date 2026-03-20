# 1000x Implementation Plan: Research-Backed Features

## Overview

This plan covers 11 features from [research.md](./research.md) Part 4, organized into 5 sprints. Each feature specifies exact files to create/modify, database changes, types, and testing requirements.

**Current state:** 37 tests passing, TypeScript strict, 5 migrations applied.

---

## Sprint 1: Quick Wins (No Backend Changes)

> Features that need only frontend work. Ship in 1 sprint.

---

### 1.1 Structured Journaling Prompts (Priority 2)

**Goal:** Add Gratitude and Reflection journal modes alongside the existing Free Write mode.

**Files to create:**
- `lib/journal-prompts.ts` — prompt bank and rotation logic

**Files to modify:**
- `app/(tabs)/journal.tsx` — add mode selector (Free Write / Gratitude / Reflection) above the text area in the entry form. When Gratitude is selected, show 3 numbered input fields ("I'm grateful for..."). When Reflection is selected, show a rotating prompt from the bank. Save the mode as a tag on the entry.
- `types/index.ts` — add `journal_mode` to `JournalEntry` interface: `journal_mode: 'free' | 'gratitude' | 'reflection' | null`

**`lib/journal-prompts.ts` design:**
```typescript
export type JournalMode = 'free' | 'gratitude' | 'reflection';

export const REFLECTION_PROMPTS = [
  'What was your biggest win today?',
  'What would you do differently?',
  'What did you learn that surprised you?',
  'What are you looking forward to tomorrow?',
  'What habit had the most impact today and why?',
  'Where did you waste time today? What triggered it?',
  'What are you avoiding? Why?',
  'What would make tomorrow a 10/10 day?',
];

export function getReflectionPrompt(dayOfYear: number): string {
  return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
}
```

**UI change in journal form:**
- Three mode chips above the text area: Free Write | Gratitude | Reflection
- Gratitude mode: replaces single text area with 3 inputs, each prefixed "1. ", "2. ", "3. "
- Reflection mode: shows the daily prompt above the text area as a styled quote
- Content is saved as a single string (gratitude entries joined with newlines, reflection prefixed with the prompt)

**Migration:** `006_journal_mode.sql`
```sql
ALTER TABLE public.journal_entries ADD COLUMN journal_mode text DEFAULT 'free';
```

**Tests:** `__tests__/journal-prompts.test.ts`
- `getReflectionPrompt` returns valid prompts for all day values
- Prompts rotate without repeating within 8 days

---

### 1.2 Implementation Intentions — If-Then Plans (Priority 4)

**Goal:** Add an optional "When [trigger], I will [habit]" field to habit creation.

**Files to modify:**
- `types/index.ts` — add to `Habit`: `trigger: string | null`
- `components/habits/HabitForm.tsx` — add optional "If-Then Trigger" text input below description: placeholder "When [situation], I will do this habit"
- `components/habits/HabitCard.tsx` — if `habit.trigger` exists, show it in small text below the title: "When: [trigger]"
- `lib/data-provider.tsx` — add `trigger` to createHabit data param, include in insert (with fallback like difficulty), default in fetchHabits mapping
- `lib/mock-data.ts` — add `trigger` to mock habits (e.g., "After morning coffee" for meditation)
- `hooks/useHabits.ts` — add `trigger` to createHabit input type

**Migration:** `007_habit_triggers.sql`
```sql
ALTER TABLE public.habits ADD COLUMN trigger_cue text;
COMMENT ON COLUMN public.habits.trigger_cue IS 'Implementation intention: "When X happens, I will do this habit"';
```

Note: column named `trigger_cue` to avoid SQL reserved word `trigger`.

**Suggestions per category:** Add trigger suggestions to `HabitForm.tsx` suggestions data:
- Focus: "After I sit down at my desk", "When I open my laptop"
- Sleep: "When the sun sets", "After I finish dinner"
- Exercise: "When my alarm goes off", "After I drop the kids at school"
- Mindfulness: "After I pour my morning coffee", "When I close my laptop for the day"

**Tests:** None strictly required — UI feature with existing form validation.

---

### 1.3 Cold Exposure Tracker (Priority 8)

**Goal:** Add a "Recovery" category and a cold exposure timer/logger.

**Files to create:**
- `components/habits/ColdExposureLog.tsx` — modal to log: duration (seconds), temperature (optional), pre/post mood rating (1-5)
- `lib/science-protocols.ts` — add 8th protocol: "Deliberate Cold Exposure" with Huberman's 11 min/week protocol

**Files to modify:**
- `types/index.ts` — add `'recovery'` to Habit category union
- `constants/Colors.ts` — add `recovery: '#06B6D4'` (cyan) to `CATEGORY_COLORS`
- `components/habits/HabitForm.tsx` — add Recovery to CATEGORIES array and add cold exposure suggestions:
  - "Cold Shower (2 min)" — easy
  - "Cold Plunge (3-5 min)" — hard
  - "Contrast Shower (hot/cold)" — moderate
- `lib/features.ts` — add `cold_exposure` protocol to science_protocols gating (free)

**Migration:** None required — `category` is a free-text column.

**Tests:** None strictly required.

---

## Sprint 2: Chronotype & Timing Intelligence

> The highest-priority feature plus the multiplier visualization. Requires profile schema changes.

---

### 2.1 Chronotype-Aware Scheduling (Priority 1)

**Goal:** Collect wake time + chronotype, compute optimal windows, surface timing recommendations.

**Files to create:**
- `lib/chronotype.ts` — scheduling engine
- `components/insights/DailyTimeline.tsx` — visual timeline showing peak windows

**Files to modify:**
- `types/index.ts` — extend `Profile`:
  ```typescript
  wake_time: string | null;       // "07:00"
  chronotype: 'early' | 'moderate' | 'late' | null;
  caffeine_cutoff: string | null; // computed, e.g. "14:00"
  ```
- `app/onboarding.tsx` — add step 2: "When do you usually wake up?" (time picker) and "Are you a morning person, night owl, or somewhere in between?" (3 options)
- `components/onboarding/GoalQuiz.tsx` — after goal selection, show chronotype step before "Get Started"
- `app/(tabs)/index.tsx` — show "Peak Focus Window" card on the Today dashboard: "Your peak window is 9:30 - 11:00 AM"
- `lib/notifications.ts` — use wake_time to schedule peak window reminders dynamically instead of hardcoded times
- `lib/ultradian-notifications.ts` — use actual wake_time from profile instead of requiring manual input

**Migration:** `008_chronotype.sql`
```sql
ALTER TABLE public.profiles
  ADD COLUMN wake_time time,
  ADD COLUMN chronotype text CHECK (chronotype IN ('early', 'moderate', 'late'));
```

**`lib/chronotype.ts` design:**
```typescript
export interface DailySchedule {
  wakeTime: Date;
  firstPeak: { start: Date; end: Date };    // wakeTime + 2.5h, 90-min window
  secondPeak: { start: Date; end: Date };   // wakeTime + 6h, 90-min window
  caffeineCutoff: Date;                      // bedTime - 8h (bedTime = wakeTime + 16h)
  windDownStart: Date;                       // bedTime - 1h
  bedTime: Date;                             // wakeTime + 16h (8h sleep target)
}

export function computeDailySchedule(wakeTime: string, chronotype: string): DailySchedule;
export function getCurrentWindow(schedule: DailySchedule): 'peak1' | 'peak2' | 'recovery' | 'wind-down' | 'sleep';
export function getNextPeakIn(schedule: DailySchedule): number; // minutes until next peak
```

**`components/insights/DailyTimeline.tsx` design:**
A horizontal timeline bar (24h) with colored segments:
- Green segments = peak focus windows
- Blue segment = recovery/light work
- Purple segment = wind-down
- Dark segment = sleep
- Red marker = caffeine cutoff
- Yellow marker = current time

Show below the Today dashboard stats.

**Tests:** `__tests__/chronotype.test.ts`
- `computeDailySchedule` returns correct peaks for early/moderate/late chronotypes
- `getCurrentWindow` returns correct window based on time of day
- Caffeine cutoff is 8h before computed bedtime
- Edge cases: very early risers (4 AM), late risers (11 AM)

---

### 2.2 Multiplier Stack Visualization (Priority 6)

**Goal:** Show users how their individual domain improvements compound multiplicatively.

**Files to create:**
- `lib/multiplier.ts` — compute domain multipliers from performance data
- `components/insights/MultiplierStack.tsx` — animated visualization
- `app/multiplier.tsx` — full-screen multiplier detail view (modal)

**Files to modify:**
- `app/(tabs)/insights.tsx` — add MultiplierStack card between WeeklyReport and PerformanceChart
- `app/_layout.tsx` — register `/multiplier` as a modal route

**`lib/multiplier.ts` design:**
```typescript
export interface DomainMultiplier {
  domain: 'sleep' | 'exercise' | 'focus' | 'habits' | 'recovery';
  label: string;
  multiplier: number;    // 1.0 = baseline, 1.3 = 30% improvement
  trend: 'up' | 'flat' | 'down';
  dataPoints: number;    // days of data backing this
}

export interface MultiplierResult {
  domains: DomainMultiplier[];
  totalMultiplier: number;         // product of all domain multipliers
  projectedAnnual: number;         // totalMultiplier × 1.01^365
  daysToTenX: number | null;       // estimated days to reach 10x
}

// Compute multiplier per domain from the last 30 days vs first 7 days
export function computeMultipliers(
  habits: HabitWithCompletions[],
  focusSessions: FocusSession[],
  dailyScores: DailyScore[]
): MultiplierResult;
```

**Multiplier computation logic:**
- **Sleep:** Ratio of sleep-category habit completion rate (last 7 days / first 7 days). No sleep habits = 1.0x.
- **Exercise:** Same for exercise-category habits.
- **Focus:** Average focus minutes per day (last 7d) / (first 7d). Capped at 2.0x.
- **Habits:** Overall weighted habit score (last 7d) / (first 7d). Capped at 2.0x.
- **Recovery:** If recovery-category habits exist, same ratio. Otherwise 1.0x.
- All multipliers floored at 1.0 (no negative multipliers).

**`components/insights/MultiplierStack.tsx` design:**
```
Your 1000x Stack
──────────────────────────────
Sleep       1.2x  ▲
Exercise    1.3x  ▲
Focus       1.5x  ▲
Habits      1.4x  ▲
Recovery    1.0x  ─
──────────────────────────────
Total       3.3x
──────────────────────────────
At this pace → 10x in 14 weeks
```
- Each domain row: label, multiplier value, trend arrow (green up / gray flat / red down)
- Total line: animated product with accent color
- Trajectory line: "At this pace → 10x in X weeks"
- Tap to open full multiplier detail modal

**Tests:** `__tests__/multiplier.test.ts`
- Multipliers default to 1.0 with no data
- Multipliers cap at 2.0x per domain
- Total is the product of all domains
- `daysToTenX` returns null if total multiplier is <= 1.0

---

## Sprint 3: Active Protocols & Skill Building

> Convert passive content into tracked programs. Deepen the focus timer.

---

### 3.1 Active Protocol System (Priority 3)

**Goal:** "Activate" a protocol to auto-create habits and track 30-day adherence with before/after scoring.

**Files to create:**
- `lib/active-protocols.ts` — protocol activation logic and progress tracking
- `components/insights/ActiveProtocolCard.tsx` — progress card for active protocol
- `hooks/useActiveProtocol.ts` — hook for protocol state management

**Files to modify:**
- `types/index.ts` — add `ActiveProtocol` interface:
  ```typescript
  export interface ActiveProtocol {
    id: string;
    user_id: string;
    protocol_id: string;
    started_at: string;
    completed_at: string | null;
    baseline_score: number | null;
    final_score: number | null;
    is_active: boolean;
  }
  ```
- `app/protocols.tsx` — add "Activate Protocol" button on each protocol detail view. When tapped: create corresponding habits, save ActiveProtocol record, show progress card.
- `lib/science-protocols.ts` — add `presetHabits` array to each protocol definition, mapping protocol steps to habit creation params (title, category, difficulty, trigger_cue)
- `lib/data-provider.tsx` — add `activateProtocol` and `fetchActiveProtocols` methods to DataProvider interface + implementations
- `app/(tabs)/insights.tsx` — show ActiveProtocolCard if user has an active protocol

**Migration:** `009_active_protocols.sql`
```sql
CREATE TABLE public.active_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  protocol_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  baseline_score int,
  final_score int,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, protocol_id, is_active)
);

ALTER TABLE public.active_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their protocols"
  ON public.active_protocols FOR ALL USING (auth.uid() = user_id);
```

**Protocol activation flow:**
1. User taps "Activate" on a protocol
2. System saves baseline performance score
3. System auto-creates 2-3 habits from `protocol.presetHabits`
4. ActiveProtocolCard shows: day count (e.g., "Day 12 of 30"), habit completion rate, baseline vs current score
5. After 30 days: mark `completed_at`, save `final_score`, show before/after comparison badge

**Tests:** `__tests__/active-protocols.test.ts`
- Protocol activation creates correct habits
- Progress calculation is accurate (day X of 30)
- Completion triggers final score save

---

### 3.2 Skill Acquisition Mode (Priority 11)

**Goal:** Add "Deliberate Practice" session type with skill tracking and spaced review reminders.

**Files to create:**
- `lib/spaced-review.ts` — optimal review interval calculator
- `components/focus/SkillLogger.tsx` — post-session skill logging modal

**Files to modify:**
- `app/(tabs)/focus.tsx` — add "Practice" as 5th session type. After a Practice session completes, show SkillLogger modal asking: "What skill?", "What weakness did you target?", "Progress (1-5)". Save to focus session notes.
- `types/index.ts` — add `'practice'` to `FocusSession.session_type` union
- `lib/notifications.ts` — add `scheduleSpacedReview(skillName, lastPracticeDate)` that schedules a reminder at optimal intervals (1d, 3d, 7d, 14d, 30d from last practice)

**Migration:** `010_skill_tracking.sql`
```sql
CREATE TABLE public.skill_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  weakness_targeted text,
  progress_rating int CHECK (progress_rating BETWEEN 1 AND 5),
  focus_session_id uuid REFERENCES public.focus_sessions(id),
  practiced_at timestamptz DEFAULT now()
);

ALTER TABLE public.skill_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their skill logs"
  ON public.skill_logs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX ON public.skill_logs (user_id, skill_name, practiced_at DESC);
```

**`lib/spaced-review.ts` design:**
```typescript
const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // days

export function getNextReviewDate(lastPractice: Date, reviewCount: number): Date {
  const interval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
  const next = new Date(lastPractice);
  next.setDate(next.getDate() + interval);
  return next;
}

export function isReviewDue(lastPractice: Date, reviewCount: number): boolean {
  return new Date() >= getNextReviewDate(lastPractice, reviewCount);
}
```

**Tests:** `__tests__/spaced-review.test.ts`
- Review intervals follow 1, 3, 7, 14, 30 day pattern
- `isReviewDue` returns true only after interval elapsed
- Review count beyond 5 stays at 30-day interval

---

## Sprint 4: Health Integration & Recovery

> Requires HealthKit activation. Build on the existing scaffolding.

---

### 4.1 HRV Recovery Score (Priority 7)

**Goal:** Read overnight HRV from Apple Health, compute a recovery score, adjust daily recommendations.

**Dependencies:** `lib/health-kit.ts` (scaffolded), `expo-health` package installation.

**Files to create:**
- `lib/recovery-score.ts` — HRV-based recovery computation
- `components/insights/RecoveryCard.tsx` — daily recovery score display
- `hooks/useRecoveryScore.ts` — hook that syncs health data and computes score

**Files to modify:**
- `lib/health-kit.ts` — uncomment implementation, add HRV and sleep stage reading:
  ```typescript
  export interface HealthData {
    steps: number;
    sleepMinutes: number;
    sleepStages: { deep: number; rem: number; light: number; awake: number };
    workoutMinutes: number;
    activeCalories: number;
    hrvMean: number | null;       // overnight HRV average (ms)
    restingHeartRate: number | null;
  }
  ```
- `app/(tabs)/index.tsx` — show RecoveryCard below stats row: "Recovery: 82/100 — Good to go" or "Recovery: 45/100 — Take it easy today"
- `app/(tabs)/focus.tsx` — if recovery < 50, show a gentle nudge: "Your recovery is low. Consider a 25-min block."

**`lib/recovery-score.ts` design:**
```typescript
export interface RecoveryInput {
  hrvMean: number | null;
  sleepMinutes: number;
  sleepConsistency: number;  // 0-1, how close wake time was to usual
  restingHeartRate: number | null;
}

// Recovery score 0-100
export function computeRecoveryScore(input: RecoveryInput, baselines: RecoveryBaselines): number;

// Baselines computed from 14-day rolling averages
export interface RecoveryBaselines {
  avgHrv: number;
  avgSleep: number;
  avgRhr: number;
}

export function getRecommendation(score: number): {
  label: string;        // "Excellent" | "Good" | "Moderate" | "Low"
  color: string;        // green | accent | warning | danger
  focusSuggestion: number;  // recommended focus block duration in minutes
  message: string;
};
```

**Recovery score formula:**
- HRV component (40%): `(todayHRV / baselineHRV) × 100`, capped 0-100
- Sleep component (40%): `(sleepMinutes / 480) × 100` (8h = 100), capped 0-100
- Consistency component (20%): `sleepConsistency × 100`
- If HRV unavailable: reweight to 60% sleep, 40% consistency

**Tests:** `__tests__/recovery-score.test.ts`
- Score is 100 when all inputs match or exceed baselines
- Score degrades proportionally with worse inputs
- Missing HRV falls back to sleep-only scoring
- Recommendations match score ranges

---

### 4.2 Exercise-Cognition Tracker (Priority 9)

**Goal:** Auto-import workouts, correlate with focus scores, show exercise-cognition relationship.

**Dependencies:** HealthKit integration (4.1), correlation engine (existing).

**Files to create:**
- `components/insights/ExerciseCognitionCard.tsx` — visualization of exercise days vs. focus scores

**Files to modify:**
- `lib/health-kit.ts` — add `fetchWorkouts(since: Date)` returning workout type, duration, and timestamp
- `lib/correlation-engine.ts` — add `computeExerciseFocusCorrelation(workouts, focusSessions)` that correlates exercise days with focus session quality
- `app/(tabs)/insights.tsx` — add ExerciseCognitionCard showing: "Focus score is X% higher on exercise days" with a simple comparison chart (exercise days avg vs. rest days avg)
- `hooks/useHealthData.ts` — add workout fetching to `syncHealthData`

**`components/insights/ExerciseCognitionCard.tsx` design:**
Two-bar comparison:
```
Exercise Days    ████████████  78
Rest Days        ██████████    62
                 Focus Score (avg)

"Your focus is 26% higher on days you exercise"
Based on 14 exercise days and 16 rest days
```

**Tests:** None beyond existing correlation engine tests — this is a UI/data layer feature.

---

## Sprint 5: Social & Planning

> Highest-effort features. Require new backend tables and real-time capabilities.

---

### 5.1 Social Accountability (Priority 5)

**Goal:** Accountability partners with shared streak visibility and streak challenges.

**Files to create:**
- `lib/accountability.ts` — partner pairing, challenge logic
- `hooks/useAccountability.ts` — partner state management
- `components/social/PartnerCard.tsx` — partner's streak status
- `components/social/ChallengeCard.tsx` — active challenge progress
- `app/accountability.tsx` — partner management screen (modal)

**Files to modify:**
- `app/(tabs)/profile.tsx` — add "Accountability Partner" section with invite/manage
- `app/(tabs)/index.tsx` — show PartnerCard on Today dashboard if partner exists
- `lib/data-provider.tsx` — add partner methods: `invitePartner`, `acceptInvite`, `fetchPartnerStatus`, `createChallenge`
- `types/index.ts` — add interfaces:
  ```typescript
  export interface AccountabilityPartner {
    id: string;
    user_id: string;
    partner_id: string;
    status: 'pending' | 'active' | 'declined';
    created_at: string;
  }

  export interface StreakChallenge {
    id: string;
    partner_id: string;  // accountability_partners.id
    habit_title: string;
    target_days: number;  // 7, 14, 30
    user_progress: number;
    partner_progress: number;
    started_at: string;
    completed_at: string | null;
  }
  ```

**Migration:** `011_accountability.sql`
```sql
CREATE TABLE public.accountability_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

CREATE TABLE public.streak_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid REFERENCES public.accountability_partners(id) ON DELETE CASCADE,
  habit_title text NOT NULL,
  target_days int NOT NULL DEFAULT 7,
  user_progress int DEFAULT 0,
  partner_progress int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their partnerships"
  ON public.accountability_partners FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users see their challenges"
  ON public.streak_challenges FOR ALL
  USING (
    partnership_id IN (
      SELECT id FROM public.accountability_partners
      WHERE user_id = auth.uid() OR partner_id = auth.uid()
    )
  );
```

**Invite flow:**
1. User taps "Add Partner" → enters partner's email
2. System creates `accountability_partners` row with `status: 'pending'`
3. Partner receives push notification with accept/decline
4. On accept: both users see each other's streak counts (not detailed data)
5. Either user can create a streak challenge: "Both maintain 7 days of [habit]"

**Privacy:** Partners only see: display name, total active streaks count, challenge progress. Never: journal entries, mood, individual habit details.

**Tests:** `__tests__/accountability.test.ts`
- Partner creation sets status to pending
- Accept changes status to active
- Challenge progress tracks correctly
- Privacy: partner data excludes sensitive fields

---

### 5.2 Predictive Daily Planner (Priority 10)

**Goal:** Morning planning screen with priority setting, optimal timing suggestions, and end-of-day review.

**Dependencies:** Chronotype scheduling (2.1), existing habits and focus timer.

**Files to create:**
- `app/daily-plan.tsx` — morning planning screen (modal)
- `components/planner/PriorityCard.tsx` — draggable priority item
- `components/planner/DayReview.tsx` — end-of-day summary
- `hooks/useDailyPlan.ts` — plan state and persistence
- `lib/daily-planner.ts` — priority suggestions and timing optimization

**Files to modify:**
- `app/_layout.tsx` — register `/daily-plan` as a modal route
- `app/(tabs)/index.tsx` — show "Plan Your Day" button if no plan exists for today, or show plan summary if one does
- `lib/notifications.ts` — add morning planning reminder at wake_time
- `types/index.ts` — add:
  ```typescript
  export interface DailyPlan {
    id: string;
    user_id: string;
    date: string;
    priorities: DailyPriority[];
    created_at: string;
  }

  export interface DailyPriority {
    id: string;
    title: string;
    session_type: FocusSession['session_type'];
    estimated_minutes: number;
    suggested_time: string | null;  // from chronotype engine
    completed: boolean;
  }
  ```

**Migration:** `012_daily_plans.sql`
```sql
CREATE TABLE public.daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  priorities jsonb NOT NULL DEFAULT '[]',
  review_notes text,
  day_rating int CHECK (day_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their plans"
  ON public.daily_plans FOR ALL USING (auth.uid() = user_id);
```

**Morning planning flow:**
1. Wake-time notification: "Good morning! Plan your top 3 priorities."
2. User opens daily-plan modal
3. "What are your top 3 priorities today?" — 3 text inputs with session type selector
4. System auto-suggests timing based on chronotype: "Priority 1 → 9:30 AM (your peak window)"
5. Plan appears on Today dashboard as a mini checklist
6. Each priority links to a focus session — tapping "Start" opens focus timer with correct session type and duration

**End-of-day review flow:**
1. 8 PM notification: "How was your day?"
2. User opens review (or it triggers after completing final habit)
3. Show completed/incomplete priorities
4. "Rate your day (1-5)" + optional reflection notes
5. Save to `daily_plans.review_notes` and `day_rating`
6. Correlate day ratings with habits and plan completion over time

**Tests:** `__tests__/daily-planner.test.ts`
- Priority timing suggestions align with chronotype peaks
- Plan persists across app restarts
- Day rating saved correctly

---

## Sprint Summary

| Sprint | Features | New Files | New Migrations | Estimated Tests |
|--------|----------|-----------|----------------|-----------------|
| 1 | Journaling prompts, If-Then plans, Cold exposure | 2 new | 2 (006, 007) | 4 |
| 2 | Chronotype scheduling, Multiplier Stack | 5 new | 1 (008) | 8 |
| 3 | Active protocols, Skill acquisition | 5 new | 2 (009, 010) | 6 |
| 4 | HRV recovery, Exercise-cognition | 4 new | 0 | 4 |
| 5 | Social accountability, Daily planner | 8 new | 2 (011, 012) | 4 |
| **Total** | **11 features** | **24 new files** | **7 migrations** | **26 new tests** |

---

## Dependency Graph

```
Sprint 1 (no dependencies)
  ├── Journaling Prompts
  ├── Implementation Intentions
  └── Cold Exposure Tracker

Sprint 2 (depends on: profile schema)
  ├── Chronotype Scheduling ──┐
  └── Multiplier Stack         │
                               │
Sprint 3 (depends on: existing protocols + focus timer)
  ├── Active Protocols         │
  └── Skill Acquisition        │
                               │
Sprint 4 (depends on: HealthKit + Sprint 2)
  ├── HRV Recovery ◄───────── expo-health install
  └── Exercise-Cognition ◄─── HRV Recovery
                               │
Sprint 5 (depends on: Sprint 2 + backend)
  ├── Social Accountability    │
  └── Daily Planner ◄──────── Chronotype Scheduling
```

Sprints 1-3 can proceed without native package installations. Sprint 4 requires `expo-health`. Sprint 5 requires the most backend work but has the highest retention impact.

---

## Migration Checklist

After each sprint, run these in order:

```bash
# Sprint 1
supabase db push  # applies 006, 007

# Sprint 2
supabase db push  # applies 008

# Sprint 3
supabase db push  # applies 009, 010

# Sprint 5
supabase db push  # applies 011, 012
```

Sprint 4 has no new migrations — it uses existing tables + HealthKit data.
