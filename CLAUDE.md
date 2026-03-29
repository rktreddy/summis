# Summis: The Science of Cognitive Performance
## Claude Code Project Guide

---

## Project Overview

**App name:** Summis (Latin: "at the peak / at the highest point")
**Concept:** A science-backed cognitive performance coach — focus sprints, cognitive hygiene tracking, and a correlation engine that proves which practices actually improve your focus. Built on Dr. Sahar Yousef's Becoming Superhuman framework and the Brain Drain study (Ward et al., 2017).
**Platforms:** iOS + Android (via React Native + Expo)
**Target audience:** Knowledge workers, high-performers, students who want evidence-based systems for peak cognitive performance. Avoid "biohacker" language — use "cognitive hygiene", "systems", and "evidence-based" framing instead.
**Monetization:** Freemium → subscription (Free / Pro $7.99/mo / Annual $49.99/yr / Lifetime $79.99)
**Positioning:** The only app that coaches you through cognitive hygiene practices AND proves which ones work with your own data. Competitors (Opal, Freedom, ScreenZen) measure inputs (less screen time). Summis measures outputs (did your focus actually improve?) and connects the two.
**Pitch:** *"Summis coaches you through science-backed focus practices and proves which ones actually work — with your own data."*

**Previous identity:** This codebase was originally "1000x" — a habit tracker with a science layer. The pivot to Summis narrows the product to cognitive performance coaching, drops general habit tracking, and centers the app on the focus sprint protocol + correlation engine. Backup of the original codebase is in `/thousandx/`.

---

## Core Product Philosophy

1. **The Phone Paradox.** Smartphones measurably reduce cognitive capacity even when silent and face-down (Ward et al., 2017). Summis lives on the phone but honestly confronts this — coaching users to put the phone away during focus work, and proving it works with their data.

2. **Subtractive, not additive.** The app removes cognitive drains from the user's environment instead of adding new tracking obligations. Total daily interaction target: under 5 minutes.

3. **Prove, don't claim.** Never say "meditation improves focus." Say "on the 18 days you meditated before sprints, your focus rating was 23% higher." Personalized data beats generic science claims. Correlation, not causation — always.

4. **The app that coaches you to use it less.** Success means low DAU by conventional standards. The metric that matters is sprint quality over time, not engagement time.

---

## Tech Stack

| Layer | Tool | Version | Notes |
|---|---|---|---|
| Framework | React Native + Expo | RN 0.83, Expo SDK 55 | Expo Router for file-based navigation |
| Language | TypeScript | 5.9 | Strict mode enabled |
| Backend | Supabase | JS SDK 2.99 | Auth, Postgres DB, Edge Functions |
| Subscriptions | RevenueCat | 9.14 | App Store + Play Store billing |
| Push notifications | Expo Notifications | 55.x | Sprint reminders + peak window alerts |
| Charts | Victory Native | 41.20 | Custom View-based charts for score trends |
| Animations | React Native Reanimated | 4.2 | Progress rings, transitions |
| State management | Zustand | 5.0 | Single store with persistence |
| Forms | React Hook Form + Zod | RHF 7.71, Zod 4.3 | Used lightly |
| Styling | StyleSheet + Colors constants | — | NativeWind installed but not actively used |
| Testing | Jest + ts-jest | Jest 30.3 | Tests for science, correlation engine, date utils |

---

## Project Structure

```
summis/
├── app/                              # Expo Router screens
│   ├── (auth)/
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── login.tsx                 # Email + Apple Sign-In
│   │   └── signup.tsx                # Registration
│   ├── (tabs)/
│   │   ├── _layout.tsx               # 3-tab navigation (Today, Sprint, Score)
│   │   ├── index.tsx                 # Today: MITs + hygiene score + sprint schedule
│   │   ├── sprint.tsx                # Sprint: 4-phase focus protocol
│   │   └── score.tsx                 # Score: Trends + correlation insights
│   ├── _layout.tsx                   # Root layout (auth guard, DataProvider, ErrorBoundary)
│   ├── onboarding.tsx                # Cognitive Hygiene Setup (multi-step)
│   ├── protocols.tsx                 # Science protocols library (modal)
│   ├── ai-insights.tsx               # AI-powered analysis (modal, Pro)
│   ├── privacy-policy/index.tsx      # Legal text
│   └── +not-found.tsx                # 404 fallback
├── components/
│   ├── ErrorBoundary.tsx             # App-wide crash boundary
│   ├── sprint/
│   │   ├── SprintIntention.tsx       # Pre-sprint: write intention + hygiene checklist
│   │   ├── SprintTimer.tsx           # The countdown timer (minimal UI)
│   │   ├── SprintRest.tsx            # Guided rest between sprints
│   │   └── SprintReflection.tsx      # Post-sprint: quality rating + intention review
│   ├── today/
│   │   ├── MITCard.tsx               # Single MIT display
│   │   ├── MITEntry.tsx              # Add/edit MIT
│   │   ├── HygieneScoreCard.tsx      # Today's cognitive hygiene compliance ring
│   │   └── SprintScheduleCard.tsx    # Upcoming sprints for today
│   ├── score/
│   │   ├── CognitivePerformanceChart.tsx  # 7-day + 30-day rolling averages
│   │   ├── HygieneCorrelationCard.tsx     # Practice × focus quality insight cards
│   │   └── TrendLabel.tsx                 # Rising/Plateau/Declining indicator
│   ├── onboarding/
│   │   ├── CognitiveHygieneSetup.tsx     # Multi-step onboarding container
│   │   ├── NotificationAudit.tsx          # Step: review notifications
│   │   ├── PhonePlacement.tsx             # Step: phone commitment
│   │   ├── PeakWindowConfig.tsx           # Step: configure peak windows
│   │   └── SprintScheduleConfig.tsx       # Step: daily sprint schedule
│   ├── focus/
│   │   └── InterruptionLogger.tsx    # One-tap interruption type logging (kept)
│   ├── insights/
│   │   ├── PerformanceChart.tsx      # Sprint quality chart
│   │   ├── WeeklyReport.tsx          # Weekly cognitive performance summary
│   │   └── CorrelationCard.tsx       # Hygiene × focus correlation card
│   └── ui/
│       ├── Button.tsx                # 4 variants: primary, secondary, outline, danger
│       ├── Card.tsx                  # Static or touchable card container
│       ├── ErrorBanner.tsx           # Inline dismissible error with retry
│       ├── PaywallModal.tsx          # Subscription modal with legal text
│       └── ProgressRing.tsx          # Animated progress ring (Reanimated)
├── lib/
│   ├── supabase.ts                   # Supabase client with ExpoSecureStore adapter
│   ├── data-provider.tsx             # DataProvider context (Supabase + Mock implementations)
│   ├── features.ts                   # Feature flag system (free/pro gating)
│   ├── science.ts                    # Science calculations (peaks, consistency, stacking)
│   ├── science-protocols.ts          # Curated protocols with citations
│   ├── chronotype-engine.ts           # AM-Shifted/Bi-Phasic/PM-Shifted energy model (Peak→Dip→Recovery)
│   ├── correlation-engine.ts         # Hygiene practice × focus quality correlations
│   ├── hygiene-engine.ts             # Cognitive hygiene practice definitions + compliance scoring
│   ├── sprint-protocol.ts            # Yousef sprint protocol logic (4 phases) + energy-phase coaching
│   ├── dnd-integration.ts            # iOS Focus API + Android DND integration
│   ├── revenuecat.ts                 # RevenueCat init, purchase, restore
│   ├── notifications.ts              # Push notification scheduling
│   ├── ultradian-notifications.ts    # Peak window reminders
│   ├── date-utils.ts                 # Shared date helpers
│   ├── health-kit.ts                 # Apple HealthKit / Google Fit (scaffolded)
│   ├── onesignal.ts                  # OneSignal scaffold
│   ├── error-logging.ts              # Sentry scaffold
│   ├── analytics.ts                  # Mixpanel scaffold
│   └── mock-data.ts                  # Demo mode data (MITs, sprints, hygiene practices)
├── hooks/
│   ├── useSprints.ts                 # Sprint CRUD, phase management, streak tracking
│   ├── useMITs.ts                    # Daily MIT management (max 3)
│   ├── useHygieneScore.ts            # Daily hygiene compliance computation
│   ├── useCognitiveScore.ts          # Cognitive performance score (new formula)
│   ├── useStreak.ts                  # Sprint streak tracking
│   ├── useSubscription.ts            # Tier check
│   ├── usePerformanceScore.ts        # Legacy — being replaced by useCognitiveScore
│   └── useHealthData.ts              # HealthKit/Google Fit access (scaffolded)
├── store/
│   └── useAppStore.ts                # Zustand: session, profile, sprints, MITs, hygiene, error
├── types/
│   ├── index.ts                      # Legacy types (kept for migration compatibility)
│   └── summis.ts                     # New Summis types (Sprint, MIT, HygieneConfig, etc.)
├── constants/
│   └── Colors.ts                     # Dark theme palette
├── __tests__/
│   ├── science.test.ts               # Science function tests
│   ├── date-utils.test.ts            # Date utility tests
│   └── correlation-engine.test.ts    # Correlation engine tests
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Original 6 tables (profiles, habits, completions, journal, focus, scores)
│   │   ├── 002_onboarding_goals.sql  # user_goal + onboarding_completed
│   │   ├── 003_habit_difficulty.sql  # difficulty column
│   │   ├── 004_interruption_types.sql # interruption_types[]
│   │   ├── 005_daily_scores.sql      # daily scores for correlation engine
│   │   └── 006_summis_redesign.sql   # NEW: sprints, mits, hygiene_configs, hygiene_logs, profile extensions
│   ├── cron.sql                      # pg_cron schedules
│   └── functions/
│       ├── ai-insights/index.ts      # Claude API for personalized insights (update prompt)
│       ├── performance-score/index.ts # Score computation (update formula)
│       └── weekly-report/index.ts    # Weekly report generation (update metrics)
└── assets/
    ├── fonts/SpaceMono-Regular.ttf
    └── images/                       # icon, splash, favicon (need Summis branding)
```

---

## Architecture

### Data Flow

```
Screens (app/)
  → Custom Hooks (hooks/)
    → Zustand Store (store/useAppStore.ts)
      → DataProvider Context (lib/data-provider.tsx)
        → supabaseProvider | mockProvider
```

### Key Architectural Patterns

**1. DataProvider Context** — All data operations go through `useData()`. Returns Supabase or Mock implementation based on `EXPO_PUBLIC_SUPABASE_URL`. No component checks demo mode directly.

**2. Optimistic Updates** — Sprint completions and MIT toggles update UI first, sync with backend, rollback on failure.

**3. Error Boundary + Error State** — `AppErrorBoundary` wraps the app. `useAppStore.error` holds runtime errors. `ErrorBanner` displays inline with retry/dismiss.

**4. Shared Date Utilities** — `lib/date-utils.ts` for all date comparisons. Never inline date logic.

**5. Protected Routes** — `useProtectedRoute()` redirects unauthenticated users to login, new users to onboarding.

---

## Tab Structure

### Tab 1: Today (`app/(tabs)/index.tsx`)
Daily command center. 30-second morning check-in.
- Greeting + date
- Cognitive hygiene compliance ring (0-100)
- MITs (3 slots): title, estimated time, completion
- Next sprint card: time until next sprint, or "Start Sprint" button
- Today's completed sprints (mini cards)
- Evening reflection (after 6 PM): day rating + optional note

### Tab 2: Sprint (`app/(tabs)/sprint.tsx`)
Core interaction. 4-phase guided experience:
1. **Intention** (30s) — Write what you'll accomplish, confirm hygiene checklist
2. **Focus** (30/45/50 min) — Minimal countdown timer, DND triggered
3. **Rest** (5-10 min) — Guided genuine rest (walk, stretch, look outside)
4. **Reflection** (10s) — Focus quality 1-5, intention met? optional note

### Tab 3: Score (`app/(tabs)/score.tsx`)
Performance trends + correlation engine payoff.
- 7-day rolling average + delta vs last week + trend label
- 30-day trend chart (7-day + 30-day rolling averages)
- Hygiene correlation cards (Pro, after 30 days) — "Focus 23% higher on phone-away days"
- Sprint quality breakdown by time of day
- Weekly summary

### Profile (header icon, not a tab)
Account, hygiene config, sprint preferences, subscription, science protocols, about.

---

## Database Schema

### Existing Tables (kept from 1000x)
- `profiles` — user data, now extended with Summis fields
- `habits` — legacy, kept for data migration but no longer primary
- `habit_completions` — legacy
- `journal_entries` — legacy
- `focus_sessions` — legacy, sprints table replaces for new flow
- `performance_scores` — weekly aggregates
- `daily_scores` — daily scores for correlation engine

### New Tables (migration 006)
- `sprints` — focus sprint records with intention, hygiene checklist, reflection
- `mits` — daily Most Important Tasks (max 3 per day)
- `hygiene_configs` — user's active cognitive hygiene practices
- `hygiene_logs` — daily compliance tracking per practice

### Profile Extensions (migration 006)
- `sprint_duration_preference` (int, default 45)
- `peak_window_start` / `peak_window_end` (time)
- `afternoon_window_start` / `afternoon_window_end` (time)
- `daily_sprint_target` (int, default 3)
- `phone_placement_commitment` (text)
- `notification_audit_completed` (boolean)
- `hygiene_setup_completed` (boolean)

### Row Level Security
All tables have RLS: `auth.uid() = user_id` for all operations.

---

## Feature Flags

```typescript
export const FEATURES = {
  // Free
  daily_sprints: 3,
  mits: true,
  basic_hygiene: true,        // 3 core practices
  sprint_timer: true,
  basic_score: true,          // Current week + delta

  // Pro
  sprints_unlimited: 'pro',
  correlation_insights: 'pro',
  trend_analysis: 'pro',
  ai_insights: 'pro',
  custom_hygiene: 'pro',
  advanced_analytics: 'pro',
  science_protocols: 'pro',
  data_export: 'pro',
} as const;
```

**Paywall trigger points:**
1. 30-day blurred correlation cards (primary — highest conversion)
2. 50 total sprints → "Unlock unlimited sprints"
3. AI Insights tap
4. Trend analysis / advanced charts
5. Custom hygiene practice (beyond 3 defaults)

---

## Cognitive Performance Score

| Component | Weight | Calculation |
|---|---|---|
| Sprint completion | 30% | Completed / target sprints |
| Focus quality | 30% | Avg self-reported rating (1-5 → 0-100) |
| Hygiene compliance | 25% | Practices followed / practices active |
| MIT completion | 15% | MITs completed / MITs set |

---

## Correlation Engine

**File:** `lib/correlation-engine.ts`

Retargeted from habit completion × overall score to hygiene practice compliance × focus quality.

- X vector: Binary hygiene compliance (did/didn't keep phone away)
- Y vector: Daily focus quality (avg sprint focus rating)
- Minimum: 30 days, 20 data points per practice
- Significance: n >= 20 AND |r| > 0.25
- Strength: |r| >= 0.5 strong, >= 0.3 moderate, >= 0.1 weak

**Edge cases:** High completers (>90%) get "too consistent to measure" message. Low completers (<10%) get "complete more consistently" message. Negative correlations surfaced honestly.

---

## Push Notifications

| Type | Trigger | Copy Style |
|---|---|---|
| Sprint reminder | 10 min before peak window | "Your peak focus window starts in 10 min" |
| Sprint streak | 8 PM if no sprints today | "Don't break your 12-day sprint streak" |
| Morning prime | Wake time | "Set your 3 MITs for today" |

**Rule:** Max 2 per day. Science framing always.

---

## Chronotype Model

Based on the Horne-Östberg Morningness-Eveningness framework (1976) and Dr. Sahar Yousef's Becoming Superhuman curriculum. Three categories with a universal Peak → Dip → Recovery energy structure:

| Chronotype | Population | Wake Default | Peak | Dip | Recovery |
|---|---|---|---|---|---|
| AM-Shifted | 20-25% | 06:00 | Wake to ~11 AM | ~11 AM-3 PM | ~3-7 PM |
| Bi-Phasic | 50-55% | 07:00 | ~9 AM-1 PM | ~1-4 PM | ~4-7 PM |
| PM-Shifted | 15-20% | 08:30 | ~12-6 PM | Morning (wake-12) | ~6-10 PM |

**Energy Phase Work-Type Mapping:**
- **Peak:** Analytical, deep work — coding, writing, strategic thinking
- **Dip:** Administrative — email, scheduling, meetings, or rest/nap
- **Recovery:** Creative, insight-driven — brainstorming, design, lateral thinking

**Implementation:** `lib/chronotype-engine.ts` computes energy windows from wake time + chronotype, provides current-phase detection, sprint coaching advice, caffeine timing, and nap window calculations.

**Onboarding:** Users self-select AM-Shifted / Bi-Phasic / PM-Shifted during setup. A new "energy preview" step shows their personalized daily energy pattern before proceeding.

**Attribution:** Always cite Dr. Yousef's curriculum and Horne & Östberg (1976) when referencing the chronotype framework. Never use "Becoming Superhuman" as a brand claim — it's a course name.

---

## Coding Conventions

- **TypeScript strict mode** — always. No `any`.
- **One component per file** — named exports
- **Data operations** — always through `useData()`, never direct Supabase in components
- **Hooks** — all data fetching in `/hooks`, never in components
- **Supabase queries** — explicit `.select()` columns, never `select('*')`
- **Error handling** — try/catch on all async, errors via `ErrorBanner` or `setError()`
- **Optimistic updates** — update UI first, sync, rollback on failure
- **Date logic** — `lib/date-utils.ts` only, never inline
- **Accessibility** — all touchable elements have `accessibilityLabel`
- **Science claims** — correlation not causation. "On days you X, your focus tends to be Y% higher"
- **Styling** — `StyleSheet.create()` with `constants/Colors.ts`
- **Demo mode** — DataProvider context only, no `if (DEMO_MODE)` checks
- **Store copy** — avoid "biohacker", "proven to". Use "evidence-based", "cognitive hygiene", "systems"

---

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=        # Empty = demo mode
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RC_KEY_IOS=
EXPO_PUBLIC_RC_KEY_ANDROID=
EXPO_PUBLIC_ONESIGNAL_APP_ID=    # Scaffolded
EXPO_PUBLIC_SENTRY_DSN=          # Scaffolded
EXPO_PUBLIC_MIXPANEL_TOKEN=      # Scaffolded
```

---

## Development Status

### Inherited from 1000x (working)
- [x] Expo + Router + TypeScript strict mode
- [x] Supabase auth (email + Apple Sign-In)
- [x] RevenueCat paywall (3 plans, restore)
- [x] Error boundary + inline error banners
- [x] DataProvider abstraction (Supabase + Mock)
- [x] Focus timer (basis for Sprint timer)
- [x] Correlation engine (needs retargeting)
- [x] Science calculations + protocols
- [x] Push notifications
- [x] 37 passing tests

### Summis Redesign — In Progress
- [ ] Phase 1: Identity + Structure (app.json, package.json, tabs, types)
- [ ] Phase 2: Core Sprint Experience (4-phase sprint flow)
- [ ] Phase 3: Today Tab + MITs
- [ ] Phase 4: Cognitive Hygiene Onboarding
- [ ] Phase 5: Score Tab + Correlation Engine retarget
- [ ] Phase 6: DND Integration + Polish
- [ ] Phase 7: Store Preparation

See `SUMMIS-REDESIGN-PLAN.md` for full implementation plan with file-by-file mapping.

---

## App Store Notes

- **Bundle ID:** `com.summis.app` (iOS + Android)
- **Domains:** summis.app, summis.org
- **Category:** Health & Fitness (or Productivity)
- **Age rating:** 4+
- **Health claims:** "Based on peer-reviewed research" — never "proven to"
- **Subscription disclosure:** Required Apple legal text in PaywallModal
- **Restore purchases:** Implemented in PaywallModal and Profile

---

## Competitive Landscape

| Competitor | What They Do | Gap vs Summis |
|---|---|---|
| Opal | Screen time blocking | Measures input only — no focus quality measurement |
| Freedom | Cross-platform blocking | No cognitive performance tracking |
| ScreenZen | Intentional phone unlocking | No sprint protocol, no correlation engine |
| one sec | Pause before app open | Micro-intervention only, no systematic coaching |
| Forest | Gamified phone-down timer | No science layer, no performance measurement |
| Centered | Flow state protection | Desktop only, no hygiene coaching |
| Rise | Sleep/energy tracking | No focus sprints, no cognitive hygiene |

**Summis's moat:** The correlation engine. Every competitor measures whether you used your phone less. None measure whether that actually made you more productive. Summis closes this loop — measuring both the environmental change AND the cognitive outcome, then connecting them with personalized data.

---

## Key Commands

```bash
npm start                    # Expo dev server
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm run typecheck            # TypeScript validation
npm test                     # Jest test suite
npm run build:dev            # EAS development build
npm run build:preview        # EAS preview build
npm run build:ios            # EAS production iOS
npm run build:android        # EAS production Android
npm run submit:ios           # App Store Connect
npm run submit:android       # Google Play
npm run db:push              # Push database migrations
npm run deploy:functions     # Deploy Edge Functions
```

---

## Research Foundation

- **Ward, Duke, Gneezy & Bos (2017)** — "Brain Drain: The Mere Presence of One's Own Smartphone Reduces Available Cognitive Capacity." Journal of the Association for Consumer Research.
- **Bailenson (2021)** — "Nonverbal Overload: A Theoretical Argument for the Causes of Zoom Fatigue." Technology, Mind, and Behavior.
- **Dr. Sahar Yousef** — "Becoming Superhuman" curriculum, UC Berkeley Haas School of Business. Cognitive hygiene framework, focus sprints, energy management, digital dependence awareness.
