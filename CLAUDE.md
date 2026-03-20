# 1000x: The Science of Productivity & Performance
## Claude Code Project Guide

---

## Project Overview

**App name:** 1000x
**Concept:** A science-backed productivity and performance app — habit tracking, journaling, focus sessions, and performance analytics grounded in peer-reviewed research (ultradian rhythms, spacing effect, circadian performance peaks, etc.)
**Platforms:** iOS + Android (via React Native + Expo)
**Target audience:** Knowledge workers, high-performers, students who want evidence-based systems for daily performance. Avoid "biohacker" language in store copy — use "systems" and "compounding" framing instead.
**Monetization:** Freemium → subscription (Free / Pro $7.99/mo / Annual $49.99/yr / Lifetime $79.99)
**Positioning:** The only app combining a science layer + focus timer + AI insights + journaling. Closest competitor is Rise (sleep/energy only). Pitch: *"Rise tells you when to perform. 1000x helps you build the systems that make you worth scheduling."*

---

## Tech Stack

| Layer | Tool | Version | Notes |
|---|---|---|---|
| Framework | React Native + Expo | RN 0.83, Expo SDK 55 | Expo Router for file-based navigation |
| Language | TypeScript | 5.9 | Strict mode enabled |
| Backend | Supabase | JS SDK 2.99 | Auth, Postgres DB, Edge Functions |
| Subscriptions | RevenueCat | 9.14 | App Store + Play Store billing |
| Push notifications | Expo Notifications | 55.x | Streak + ultradian reminders |
| Charts | Victory Native | 41.20 | Installed; custom View-based charts used for most screens |
| Animations | React Native Reanimated | 4.2 | Progress rings, transitions |
| State management | Zustand | 5.0 | Single store with error state |
| Forms | React Hook Form + Zod | RHF 7.71, Zod 4.3 | Installed; used lightly (HabitForm) |
| Styling | StyleSheet + Colors constants | — | NativeWind 4.2 installed but not actively used |
| Testing | Jest + ts-jest | Jest 30.3 | 37 tests covering science, date utils, and correlation engine |

---

## Project Structure

```
1000x/
├── app/                              # Expo Router screens
│   ├── (auth)/
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── login.tsx                 # Email + Apple Sign-In
│   │   └── signup.tsx                # Registration with profile creation
│   ├── (tabs)/
│   │   ├── _layout.tsx               # 6-tab bottom navigation
│   │   ├── index.tsx                 # Dashboard / Today view
│   │   ├── habits.tsx                # Full habit list with streak rings
│   │   ├── journal.tsx               # Journal entries with mood/energy
│   │   ├── focus.tsx                 # Pomodoro focus timer
│   │   ├── insights.tsx              # Performance analytics (Pro-gated)
│   │   └── profile.tsx               # Settings, subscription, sign-out
│   ├── _layout.tsx                   # Root layout (auth guard, DataProvider, ErrorBoundary)
│   ├── onboarding.tsx                # [P1] Goal quiz + pre-loaded habit setup (NEW)
│   ├── protocols.tsx                 # Science protocols library (modal)
│   ├── ai-insights.tsx               # AI-powered analysis (modal, Pro)
│   ├── privacy-policy/index.tsx      # Legal text
│   └── +not-found.tsx                # 404 fallback
├── components/
│   ├── ErrorBoundary.tsx             # App-wide crash boundary
│   ├── habits/
│   │   ├── HabitCard.tsx             # Habit row with checkbox, category badge, streak
│   │   ├── StreakRing.tsx            # Color-coded streak circle
│   │   └── HabitForm.tsx             # Modal form with category-based suggestions, difficulty selector
│   ├── journal/
│   │   └── JournalEntry.tsx          # Entry display component
│   ├── focus/
│   │   └── InterruptionLogger.tsx    # [P2] One-tap interruption type logging (NEW)
│   ├── insights/
│   │   ├── PerformanceChart.tsx      # Bar chart (View-based)
│   │   ├── HabitCompletionChart.tsx  # 7-day heatmap grid
│   │   ├── WeeklyReport.tsx          # Score card with delta indicators
│   │   └── CorrelationCard.tsx       # [P3] "Focus 34% higher on exercise days" (NEW)
│   ├── onboarding/
│   │   ├── GoalQuiz.tsx              # [P1] 4-question goal selector (NEW)
│   │   └── HabitPreloader.tsx        # [P1] Pre-loads habits from goal selection (NEW)
│   ├── social/
│   │   └── StreakShareCard.tsx        # [P3] Shareable milestone image (NEW)
│   └── ui/
│       ├── Button.tsx                # 4 variants: primary, secondary, outline, danger
│       ├── Card.tsx                  # Static or touchable card container
│       ├── ErrorBanner.tsx           # Inline dismissible error with retry
│       ├── PaywallModal.tsx          # Subscription modal with legal text
│       └── ProgressRing.tsx          # Animated progress ring (Reanimated)
├── lib/
│   ├── supabase.ts                   # Supabase client with ExpoSecureStore adapter
│   ├── data-provider.tsx             # DataProvider context (Supabase + Mock implementations)
│   ├── features.ts                   # Feature flag system (canAccess function)
│   ├── science.ts                    # Science calculations (streak, consistency, stacking, peaks)
│   ├── science-protocols.ts          # 7 curated protocols with citations
│   ├── revenuecat.ts                 # RevenueCat init, purchase, restore
│   ├── notifications.ts              # Push notification scheduling (streak protection)
│   ├── ultradian-notifications.ts    # Peak performance window reminders
│   ├── date-utils.ts                 # Shared date helpers (isToday, isCompletedToday)
│   ├── health-kit.ts                 # [P2] Apple HealthKit / Google Fit integration (NEW)
│   ├── correlation-engine.ts         # [P3] Habit × performance correlation analysis (NEW)
│   ├── streak-milestones.ts         # [P3] Milestone detection (7/14/30/60/100 days) (NEW)
│   ├── onesignal.ts                 # [P3] OneSignal push notification scaffold (NEW)
│   ├── error-logging.ts             # [P3] Sentry error reporting scaffold (NEW)
│   ├── analytics.ts                 # [P3] Mixpanel analytics scaffold (NEW)
│   ├── journal-export.ts            # Journal export formatting (text + CSV)
│   └── mock-data.ts                  # Demo mode data (3 habits, 4 journals, 6 sessions)
├── hooks/
│   ├── useHabits.ts                  # Habit CRUD with optimistic updates + rollback
│   ├── useStreak.ts                  # Current/longest streak, completedToday
│   ├── useSubscription.ts            # Tier check, canAddHabit
│   ├── usePerformanceScore.ts        # Weekly score computation with delta
│   └── useHealthData.ts              # [P2] HealthKit/Google Fit data access (NEW)
├── store/
│   └── useAppStore.ts                # Zustand: session, profile, habits, error, loading, milestoneHabit
├── types/
│   └── index.ts                      # Interfaces: Profile, Habit (with difficulty, general category), HabitCompletion, HabitWithCompletions, JournalEntry, FocusSession, DailyScore, PerformanceScore
├── constants/
│   └── Colors.ts                     # Dark theme palette + category colors
├── __tests__/
│   ├── science.test.ts               # 20 tests for science functions
│   ├── date-utils.test.ts            # 6 tests for date utilities
│   └── correlation-engine.test.ts   # [P3] 11 tests for Pearson correlation (NEW)
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # All 6 tables, RLS policies, indexes
│   │   ├── 002_onboarding_goals.sql  # [P1] user_goal + onboarding_completed on profiles (NEW)
│   │   ├── 003_habit_difficulty.sql  # [P2] difficulty column on habits (NEW)
│   │   ├── 004_interruption_types.sql # [P2] interruption_types[] on focus_sessions (NEW)
│   │   └── 005_daily_scores.sql     # [P3] daily scores table for correlation engine (NEW)
│   ├── cron.sql                     # pg_cron schedules for weekly report + score batch
│   └── functions/
│       ├── ai-insights/index.ts      # Claude Sonnet API for personalized insights
│       ├── performance-score/index.ts # Weekly score computation (cron/on-demand)
│       └── weekly-report/index.ts    # Sunday report with notification payload
└── assets/
    ├── fonts/SpaceMono-Regular.ttf
    └── images/                       # icon, splash, favicon, android adaptive icons
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

**1. DataProvider Context** — All data operations go through `useData()` which returns either the Supabase or Mock implementation based on whether `EXPO_PUBLIC_SUPABASE_URL` is set. No component or hook checks `DEMO_MODE` directly.

**2. Optimistic Updates** — `useHabits.toggleHabitCompletion()` updates the UI immediately, then syncs with the backend. On failure, it rolls back to the previous state and surfaces an error.

**3. Error Boundary + Error State** — `AppErrorBoundary` (class component) wraps the entire app to catch render crashes. `useAppStore.error` holds runtime errors surfaced by hooks. `ErrorBanner` component displays them inline with retry/dismiss actions.

**4. Shared Date Utilities** — `lib/date-utils.ts` provides `isToday()`, `isCompletedToday()`, `findTodayCompletion()`. Used by HabitCard, useStreak, useHabits, and the Today dashboard instead of duplicating date logic.

**5. Protected Routes** — `useProtectedRoute()` in `_layout.tsx` redirects unauthenticated users to login, and authenticated users away from auth screens.

---

## Database Schema (Supabase / Postgres)

### Tables — current + pending migrations

```sql
-- 001_initial_schema.sql (DONE)
-- 1. profiles — extends auth.users with app-specific data
-- 2. habits — habit definitions with science notes, category, frequency
-- 3. habit_completions — daily check-ins with optional quality rating (1-5)
-- 4. journal_entries — reflections with mood (1-5), energy (1-5), tags[]
-- 5. focus_sessions — timer records with type, duration, interruptions
-- 6. performance_scores — weekly aggregated scores (unique per user+week)

-- 002_onboarding_goals.sql [P1 — DONE]
ALTER TABLE public.profiles ADD COLUMN user_goal text;

-- 003_habit_difficulty.sql [P2 — DONE]
ALTER TABLE public.habits ADD COLUMN difficulty text DEFAULT 'moderate';
-- Values: 'easy' (0.5x), 'moderate' (1.0x), 'hard' (1.5x)

-- 004_interruption_types.sql [P2 — DONE]
ALTER TABLE public.focus_sessions ADD COLUMN interruption_types text[] DEFAULT '{}';

-- 005_daily_scores.sql [P3 — DONE]
-- New table: daily_scores (user_id, date, overall/habit/focus/consistency scores)
-- Used by correlation engine for Pearson r computation
```

### Row Level Security
All tables have RLS enabled. Each table has per-operation policies (select, insert, update, delete) ensuring `auth.uid() = user_id`. See migration files for full policy definitions.

### Indexes
Composite indexes on `(user_id, completed_at)` for habit completions and user-scoped indexes on all tables for fast lookups.

---

## Feature Flags (Free vs Pro)

Defined in `lib/features.ts`:

| Feature | Free | Pro |
|---|---|---|
| Habits | Max 5 *(raised from 3 — see rationale below)* | Unlimited |
| Journal | Yes | Yes |
| Focus timer | Yes | Yes |
| Basic streaks | Yes | Yes |
| Science protocols | 4 of 7 | All 7 |
| AI insights | No | Yes |
| Performance analytics | No | Yes |
| Journal export | No | Yes |
| Advanced charts | No | Yes |
| Weekly report | No | Yes |
| Correlation engine | No | Yes |
| Home screen widget | Basic | Full |

**Free tier rationale:** Limit raised from 3 → 5 habits. At 3, users hit the paywall on day 1 before they're invested. At 5, they have room to feel the value and build a routine before upgrading.

**Paywall trigger points (in order of conversion effectiveness):**
1. User tries to add a 6th habit
2. After completing a 7-day streak milestone — emotion is highest here, best conversion moment
3. User taps "AI Insights" tab
4. User tries to export journal
5. Locked protocols show a lock icon — passive upsell

---

## Science Layer

### Implemented in `lib/science.ts` (all tested):

| Function | Returns | Description |
|---|---|---|
| `getNextPeakWindow(sleepTime)` | Date | First ultradian peak (2.5 hrs post-wake) |
| `getAlertnessPeak(wakeTime)` | {peak, window} | Circadian peak (3 hrs post-wake, 90-min window) |
| `calculateHabitStackScore(completions)` | 0-100 | % of completions clustered within 30-min windows |
| `calculateConsistencyScore(completions, days)` | 0-100 | Weighted completion rate with recency bias |
| `calculateStreak(completions)` | number | Consecutive days from today (skips today if incomplete) |

### Science Protocols — `lib/science-protocols.ts`

7 curated routines with peer-reviewed citations:
- [x] 90-minute ultradian focus blocks (Peretz Lavie, 1985)
- [x] 2-minute rule / Tiny Habits (BJ Fogg, 2019)
- [x] Spaced repetition (Cepeda et al., 2006)
- [x] Morning priming protocol
- [x] Sleep consistency tracking
- [x] Zone 2 cardio for cognitive performance (Voss et al., 2013)
- [x] Caffeine timing optimizer (Drake et al., 2013)

### Performance Score

**Current formula (v1):**
- 40% habit completion rate (unique days / possible days)
- 30% focus score (total minutes / 600-minute target, capped at 100)
- 30% consistency (days with any activity / 7)

**v2 formula (IMPLEMENTED — P2 difficulty feature):**
- Weight habit score by difficulty: `weighted_habit_score = sum(completion × weight) / sum(possible × weight)`
- Easy = 0.5x, Moderate = 1.0x, Hard = 1.5x (default: Moderate)
- Prevents gaming a perfect score with trivial habits

---

## Push Notifications

Implemented in `lib/notifications.ts` and `lib/ultradian-notifications.ts`:

| Type | Trigger | Implementation |
|---|---|---|
| Streak protection | 8 PM daily | `scheduleStreakReminder()` |
| Peak performance | 20 min before ultradian peak | `scheduleUltradianNotifications()` |
| Morning prime | User's wake time | `scheduleMorningPrime()` |

**Rule:** Max 2 notifications per day. Uses Expo Notifications only (OneSignal in P3 backlog).

**Copy principle:** Science framing always beats generic reminders.
- ✅ Good: *"Your ultradian rhythm peaks in 20 min — great time for deep work"*
- ❌ Bad: *"Time to focus!"*
- ✅ Good: *"Don't break your 14-day streak — 2 habits left today"*
- ❌ Bad: *"Complete your habits!"*

---

## RevenueCat Setup

Implemented in `lib/revenuecat.ts`:

```typescript
export const ENTITLEMENTS = { pro: 'pro_access' };
export const PRODUCT_IDS = {
  monthly: 'com.1000x.pro.monthly',    // $7.99/mo
  annual: 'com.1000x.pro.annual',      // $49.99/yr (~48% savings)
  lifetime: 'com.1000x.lifetime',      // $79.99 one-time
};
```

Functions: `initRevenueCat()`, `checkProAccess()`, `getOfferings()`, `purchasePackage()`, `restorePurchases()`.

Platform-specific API keys via `EXPO_PUBLIC_RC_KEY_IOS` / `EXPO_PUBLIC_RC_KEY_ANDROID`.

---

## Supabase Edge Functions

### `/functions/performance-score`
Computes weekly scores server-side. Supports POST (single user) and cron (batch). Same formula as client-side hook. Update when difficulty weighting ships (P2).

### `/functions/weekly-report`
Sunday 8am cron. Generates current vs previous week delta, top habit, total focus time, and notification payload.

### `/functions/ai-insights`
Calls Claude Sonnet API with 30 days of anonymized user data. Returns 3–5 insights (observation/suggestion/correlation). Falls back to generic insights if API unavailable. When correlation engine ships (P3), include correlation data in the prompt context.

---

## Coding Conventions

- **TypeScript strict mode** — always. No `any`.
- **Component files** — one component per file, named exports
- **Data operations** — always through `useData()` provider, never direct Supabase calls in components
- **Hooks** — all data fetching via custom hooks in `/hooks`, never directly in components
- **Supabase queries** — always use `.select()` with explicit columns, never `select('*')`
- **Error handling** — all async operations wrapped in try/catch, errors surfaced via `ErrorBanner` or `setError()`
- **Optimistic updates** — toggle operations update UI first, sync with server, rollback on failure
- **Date logic** — use shared utilities from `lib/date-utils.ts`, never inline date comparisons
- **Accessibility** — all touchable elements have `accessibilityLabel`
- **Science claims** — every in-app science reference must have a corresponding citation in `lib/science-protocols.ts`
- **Styling** — use `StyleSheet.create()` with colors from `constants/Colors.ts`
- **Demo mode** — handled entirely by the DataProvider context, not by `if (DEMO_MODE)` checks
- **Habit deletion** — always soft delete (`is_active = false`), never hard delete. Preserves completion history for correlation engine and AI insights
- **Habit categories** — 6 options: focus, sleep, exercise, nutrition, mindfulness, general. The `general` category is for habits that don't fit the other five
- **Habit form** — category-first flow: user picks a category, then sees 4 category-specific suggestions they can tap to auto-fill, or type a custom habit
- **Web compatibility** — use `confirm()` instead of `Alert.alert()` on web; add `onSubmitEditing` to form inputs for Enter key support
- **Store copy** — avoid "biohacker" and "proven to" language. Use "based on peer-reviewed research", "systems", "compounding"

---

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=        # Supabase project URL (empty = demo mode)
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
EXPO_PUBLIC_RC_KEY_IOS=          # RevenueCat iOS API key
EXPO_PUBLIC_RC_KEY_ANDROID=      # RevenueCat Android API key
EXPO_PUBLIC_ONESIGNAL_APP_ID=    # OneSignal App ID (scaffolded in lib/onesignal.ts)
EXPO_PUBLIC_SENTRY_DSN=          # Sentry DSN (scaffolded in lib/error-logging.ts)
EXPO_PUBLIC_MIXPANEL_TOKEN=      # Mixpanel token (scaffolded in lib/analytics.ts)
```

When `EXPO_PUBLIC_SUPABASE_URL` is empty or undefined, the app runs in **demo mode** with mock data — no backend required.

---

## Development Status & Roadmap

### ✅ Phase 1 — MVP: COMPLETE
- [x] Expo project with Router + TypeScript strict mode
- [x] Supabase auth (email + Apple Sign-In)
- [x] Profiles table + auto-creation on first login
- [x] Habits CRUD (create, complete, delete) with optimistic updates
- [x] Streak calculation logic (current + longest)
- [x] Today dashboard with stats cards
- [x] Basic push notification (streak protection at 8 PM)
- [x] Demo mode with mock data

### ✅ Phase 2 — Core Features: COMPLETE
- [x] Journal entries with mood (1-5) + energy (1-5) tracking
- [x] Focus session timer (25/45/90 min presets, 4 session types, Pomodoro breaks)
- [x] RevenueCat paywall integration (3 plans, restore purchases)
- [x] Performance score v1 (weighted: 40% habits, 30% focus, 30% consistency)
- [x] Habit completion charts (7-day heatmap, performance bar chart, weekly report)
- [x] Feature flags + subscription gating
- [x] Privacy policy screen

### ✅ Phase 3 — Science Layer: COMPLETE
- [x] Science protocols screen (7 protocols with citations, free/pro gating)
- [x] Ultradian rhythm notifications (peak window reminders)
- [x] AI insights screen (Claude API via Edge Function, with fallback)
- [x] Performance score with week-over-week delta
- [x] DataProvider abstraction (Supabase + Mock implementations)
- [x] Error boundary + inline error banners
- [x] Unit tests for science functions + correlation engine (37 tests passing)
- [x] Weekly performance report cron deployment (`supabase/cron.sql` — Saturday score batch + Sunday report)
- [x] Journal export (Pro feature) — text format via native share sheet, paywall-gated for free users

---

### ✅ P1 — Critical Pre-Launch Improvements: COMPLETE

#### 1. Raise free habit limit from 3 → 5 ✅
- `lib/features.ts`: `habits_limit` updated from `3` to `5`

#### 2. Onboarding goal quiz ✅
- `app/onboarding.tsx`, `components/onboarding/GoalQuiz.tsx`, `components/onboarding/HabitPreloader.ts`
- `supabase/migrations/002_onboarding_goals.sql` — adds `user_goal` column
- 4-option goal quiz (Focus/Sleep/Fitness/General), each pre-loads 3 habits with difficulty + science notes
- Protected route redirects new users to onboarding when `onboarding_completed` is false

---

### ✅ P2 — High-Value Pre/Post-Launch Features: MOSTLY COMPLETE

#### 3. Apple Health / Google Fit integration ✅ (scaffolded)
- `lib/health-kit.ts` + `hooks/useHealthData.ts` — types, auto-complete rules, permission flow ready
- `app.json` — `ACTIVITY_RECOGNITION` permission added for Android, `NSHealthShareUsageDescription` already in iOS infoPlist
- **Activate:** Install `expo-health` and uncomment the implementation blocks in `health-kit.ts`

#### 4. Habit difficulty weighting ✅
- `supabase/migrations/003_habit_difficulty.sql` — adds `difficulty` column (easy/moderate/hard)
- `HabitForm.tsx` — Easy/Moderate/Hard selector with color-coded chips
- `usePerformanceScore.ts` + Edge Function — weighted formula (easy 0.5x, moderate 1x, hard 1.5x)
- All preset habits in HabitPreloader tagged with appropriate difficulty

#### 5. Focus session interruption type logging ✅
- `supabase/migrations/004_interruption_types.sql` — adds `interruption_types text[]`
- `components/focus/InterruptionLogger.tsx` — bottom sheet with Phone/Person/Thought/Other
- `focus.tsx` — shows logger on Pause, saves types with session

#### 6. Home screen widget
- **Status:** NOT STARTED — requires `expo-widgets` (iOS) and `react-native-android-widget` (Android)
- **Next step:** Install packages and implement when native builds are configured

---

### ✅ P3 — Growth Features: MOSTLY COMPLETE

#### 7. Streak sharing / social card ✅
- `lib/streak-milestones.ts` — milestone detection (7, 14, 30, 60, 100 days) with messages
- `components/social/StreakShareCard.tsx` — branded modal with streak count, fire emoji, share/dismiss
- `store/useAppStore.ts` — `milestoneHabit` state for trigger tracking
- `hooks/useHabits.ts` — checks milestones after successful completion toggle
- `app/(tabs)/index.tsx` — shows card overlay, uses `Share.share()` for native share sheet

#### 8. Habit correlation engine ✅
- `lib/correlation-engine.ts` — Pearson correlation with edge case handling (high/low completers)
- `components/insights/CorrelationCard.tsx` — strength badge, progress bar, natural language insight
- `supabase/migrations/005_daily_scores.sql` — daily scores table with RLS
- `__tests__/correlation-engine.test.ts` — 11 tests (pearson known inputs, edge cases, sort order)

#### 9. OneSignal integration ✅ (scaffolded)
- `lib/onesignal.ts` — init, user tags, logout stubs
- **Activate:** Install `react-native-onesignal`, set `EXPO_PUBLIC_ONESIGNAL_APP_ID`, uncomment implementation

#### 10. Error logging + analytics ✅ (scaffolded)
- `lib/error-logging.ts` — Sentry init, captureException, setUser, clearUser stubs
- `lib/analytics.ts` — Mixpanel init, all event names defined, trackEvent, identifyUser stubs
- **Activate:** Install `@sentry/react-native` + `mixpanel-react-native`, set env vars, uncomment implementation

---

### 📦 Phase 7 — Store Submission: NOT STARTED
- [ ] EAS Build configuration (profiles exist, project ID placeholder)
- [ ] App Store Connect setup + screenshots
- [ ] Google Play Console setup
- [ ] Host privacy policy at a public URL
- [ ] TestFlight beta testing
- [ ] Production Supabase environment

---

## App Store Notes

- **Bundle ID:** `com.thousandx.app` (iOS + Android)
- **Category:** Health & Fitness
- **Age rating:** 4+
- **Privacy policy:** Screen exists at `/privacy-policy`, must be hosted at a public URL before submission
- **Health claims:** Use "based on peer-reviewed research" — never "proven to" language
- **Subscription disclosure:** PaywallModal includes required Apple legal text (auto-renewal, cancellation terms)
- **Restore purchases:** Implemented in PaywallModal and Profile screen (required by Apple)
- **Apple Sign-In:** Enabled in `app.json` (required since the app offers social login)
- **HealthKit (when added):** Requires `NSHealthShareUsageDescription` in `app.json` and a clear explanation in App Store review notes of why health data is accessed

---

## Competitive Landscape

| Competitor | Strength | Gap vs 1000x |
|---|---|---|
| Streaks | Clean iOS design | iOS only, no focus timer, no AI, no analytics |
| Habitica | Gamification, social | No science layer, no performance data |
| Finch | Mental health positioning | No focus, no performance tracking |
| Structured | Day planning, timeline UI | Scheduling app, not a habit app, no science |
| Rise | Science credibility, energy tracking | Sleep/energy only — no habits, no focus timer |
| Reclaim AI | AI scheduling, focus blocks | No habits, no journal, no science layer |

**White space:** No competitor combines science layer + focus timer + AI insights + journaling. That is 1000x's unique and defensible position.

---

## Future Feature Backlog (Research-Driven)

Add new science protocols here as you research them. Each is a potential future Pro feature.

```
[ ] HRV (Heart Rate Variability) tracking integration
[ ] Light exposure logging (circadian optimization)
[ ] Cold exposure / heat therapy tracker
[ ] VO2 max / Zone 2 cardio correlation with cognitive output
[ ] Sleep consistency score (regularity, not just duration)
[ ] Stress / recovery balance (training load model)
[ ] Friend streaks / accountability partners
[ ] AI journaling prompts (guided reflection)
[ ] Wearable integrations (Oura, Whoop, Garmin)
[ ] Caffeine half-life calculator (personalized cutoff time based on chronotype)
[ ] Habit difficulty auto-suggestion (AI recommends difficulty from completion history)
[ ] Migrate StyleSheet → NativeWind for faster styling iteration
```

---

## Performance Measurement & Habit Attribution

This section defines how 1000x measures performance improvement over time and identifies which habits are responsible for those improvements. This is the scientific core of the correlation engine (P3) and the AI insights system.

---

### Measurement Philosophy

The app collects **correlational data, not experimental data**. Users cannot be randomly assigned to "do" or "skip" a habit to isolate causation. What the engine provides is rigorous correlation with honest framing — never claiming causation, always saying "on days you complete X, your score tends to be higher."

The target audience (knowledge workers, high-performers) will appreciate this honesty. Overclaiming undermines trust with exactly the users most likely to pay.

---

### Layer 1: Measuring Performance Improvement

Use **three overlapping time windows** — not just the raw weekly score:

| Window | Purpose | How to display |
|---|---|---|
| Daily score | Raw signal | Small chart, not primary |
| 7-day rolling average | Smooths out single missed days | Primary trend line |
| 30-day rolling average | Reveals genuine improvement vs lucky weeks | Secondary context line |

**Reading the signal:**
- All three rising → genuine performance improvement
- Daily spikes but 30-day flat → noise, not signal
- 7-day rising but 30-day declining → short burst, not sustained

**Delta is more important than the absolute score.** A score of 72 is meaningless. A score of 72 that was 61 last week tells a story. Always display week-on-week delta as the primary number in the insights header.

**Trend labels** (computed from 30-day slope):
- Rising: 30-day average up > 5 points over the window
- Plateau: change within ±5 points
- Declining: 30-day average down > 5 points

---

### Layer 2: Habit Attribution — The Correlation Engine

**File:** `lib/correlation-engine.ts`
**Minimum data requirement:** 30 days total, at least 20 data points per habit before showing any correlation. Display "Building your data — check back in X days" below this threshold.

#### Algorithm: Pearson Correlation

For each habit, compute the Pearson correlation coefficient `r` between:
- The habit's **binary completion vector** (1 = completed, 0 = skipped) over the window
- Each **performance sub-score** (focus, habit, consistency, overall) for the same days

```typescript
// lib/correlation-engine.ts

export interface HabitCorrelation {
  habitId: string;
  habitName: string;
  completionRate: number;       // 0–1
  correlation: number;          // Pearson r, -1 to 1
  targetMetric: 'focus' | 'habit' | 'consistency' | 'overall';
  sampleSize: number;           // days of data
  isSignificant: boolean;       // requires n >= 20 AND |r| > 0.25
  direction: 'positive' | 'negative' | 'none';
  strengthLabel: 'strong' | 'moderate' | 'weak';
}

// Pearson correlation between two equal-length numeric arrays
function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = x.reduce((a, b) => a + b) / n;
  const my = y.reduce((a, b) => a + b) / n;
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  );
  return den === 0 ? 0 : num / den;
}

export function computeHabitCorrelations(
  habits: HabitWithCompletions[],
  scores: DailyScore[],    // one score object per day for the window
  windowDays = 30
): HabitCorrelation[] {
  const results: HabitCorrelation[] = [];

  for (const habit of habits) {
    const completionVec: number[] = [];
    const focusVec: number[] = [];

    for (const dayScore of scores.slice(-windowDays)) {
      const completed = habit.completions.some(c =>
        isSameDay(new Date(c.completed_at), new Date(dayScore.date))
      );
      completionVec.push(completed ? 1 : 0);
      focusVec.push(dayScore.focusScore);
    }

    const n = completionVec.length;
    const r = pearson(completionVec, focusVec);
    const completionRate = completionVec.reduce((a, b) => a + b) / n;

    results.push({
      habitId: habit.id,
      habitName: habit.title,
      completionRate,
      correlation: r,
      targetMetric: 'focus',
      sampleSize: n,
      isSignificant: n >= 20 && Math.abs(r) > 0.25,
      direction: r > 0.1 ? 'positive' : r < -0.1 ? 'negative' : 'none',
      strengthLabel: Math.abs(r) >= 0.5 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak',
    });
  }

  // Significant correlations first, then sorted by strength
  return results.sort((a, b) => {
    if (a.isSignificant !== b.isSignificant) return b.isSignificant ? 1 : -1;
    return Math.abs(b.correlation) - Math.abs(a.correlation);
  });
}
```

#### Correlation Strength Thresholds

| |r| range | Label | What to show in UI |
|---|---|---|
| ≥ 0.50 | Strong | Green badge — "strong link" |
| 0.30–0.49 | Moderate | Amber badge — "moderate link" |
| 0.10–0.29 | Weak | Gray badge — "weak link" |
| < 0.10 | None | Do not surface in UI |

#### Edge Cases — Handle Explicitly

**High completers (> 90% rate):** Pearson needs variance in both vectors. A habit done every day produces a near-constant vector — the correlation is unreliable. Show: *"You complete this habit too consistently to measure its isolated impact — that's a good sign."*

**Low completers (< 10% rate):** Same problem — not enough "done" days to detect signal. Show: *"Complete this habit more consistently to unlock its impact score."*

**Negative correlations:** Rare but possible (e.g. late-night work habit correlating negatively with next-day focus). Surface these honestly — they're valuable insights. Label clearly as "negative link."

---

### Layer 3: AI Insight Generation

When calling the Claude API in `/functions/ai-insights`, pass the ranked `HabitCorrelation[]` array as structured context alongside the user's weekly scores. Prompt structure:

```typescript
const prompt = `
You are analyzing 30 days of productivity data for a user of 1000x, a science-backed performance app.

Weekly performance: score ${currentScore}/100, delta ${delta > 0 ? '+' : ''}${delta} vs last week.
Trend: ${trendLabel} (30-day).

Top habit correlations (Pearson r, focus score):
${correlations
  .filter(c => c.isSignificant)
  .slice(0, 5)
  .map(c => `- "${c.habitName}": r=${c.correlation.toFixed(2)}, completion ${Math.round(c.completionRate * 100)}%, ${c.strengthLabel} ${c.direction} link`)
  .join('\n')}

Generate 3 insights in JSON format: { observations: string[], suggestions: string[], correlations: string[] }

Rules:
- Use "on days you complete X, your score tends to be Y% higher" — never claim causation
- Be specific with numbers
- Suggestions must be actionable (one concrete next step)
- Keep each insight under 25 words
`;
```

---

### New Database Table: `daily_scores`

The correlation engine requires a **daily score record** — not just the weekly aggregate already stored in `performance_scores`. Add migration `005_daily_scores.sql`:

```sql
create table public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  overall_score int,
  habit_score int,
  focus_score int,
  consistency_score int,
  computed_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_scores enable row level security;
create policy "Users own their daily scores"
  on public.daily_scores for all using (auth.uid() = user_id);
create index on public.daily_scores (user_id, date desc);
```

Compute and upsert a `daily_scores` row each time the user completes a habit or ends a focus session. This is what the correlation vectors are built from.

---

### UI: CorrelationCard Component

**File:** `components/insights/CorrelationCard.tsx`
**Location:** Shown in `ai-insights.tsx`, Pro-gated
**Requires:** `isSignificant === true` before rendering any card

Display format per card:
```
[Habit name]          [strength badge]
████████░░  82% completion
"On days you complete this habit, your focus
score is 34% higher on average."
r = 0.71 · 30 days of data
```

Never show raw `r` values as the primary number — translate to percentages or plain language for the user. The `r = 0.71` detail can appear as secondary fine print for users who want it.

---

### Testing Requirements

Add to `__tests__/`:
- `correlation-engine.test.ts` — unit tests for `pearson()` with known inputs, edge cases (all-zeros, all-ones, length < 20), and `computeHabitCorrelations()` sort order
- `daily-scores.test.ts` — test daily score computation matches weekly formula at 7-day rollup

---

## Key Commands

```bash
# Development
npm start                    # Expo dev server
npm run ios                  # Open iOS simulator
npm run android              # Open Android emulator
npm run typecheck            # TypeScript validation
npm test                     # Run Jest test suite (37 tests)

# Building
npm run build:dev            # EAS development build
npm run build:preview        # EAS preview build
npm run build:ios            # EAS production iOS
npm run build:android        # EAS production Android

# Submission
npm run submit:ios           # Submit to App Store Connect
npm run submit:android       # Submit to Google Play

# Supabase
npm run db:push              # Push database migrations
npm run deploy:functions     # Deploy all Edge Functions

# Simulator troubleshooting
npx expo start --localhost   # Use localhost instead of LAN IP (fixes timeout issues)
npx expo run:ios             # Build native client directly (bypasses Expo Go)
```
