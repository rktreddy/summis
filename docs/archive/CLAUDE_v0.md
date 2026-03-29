# 1000x: The Science of Productivity & Performance
## Claude Code Project Guide

---

## Project Overview

**App name:** 1000x
**Concept:** A science-backed productivity and performance app — habit tracking, journaling, focus sessions, and performance analytics grounded in peer-reviewed research (ultradian rhythms, spacing effect, circadian performance peaks, etc.)
**Platforms:** iOS + Android (via React Native + Expo)
**Target audience:** High-performers, biohackers, knowledge workers, students who want evidence-based tools
**Monetization:** Freemium → subscription (Free / Pro $7.99/mo / Annual $49.99/yr / Lifetime $79.99)

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
| Testing | Jest + ts-jest | Jest 30.3 | 26 tests covering science + date utils |

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
│   ├── protocols.tsx                 # Science protocols library (modal)
│   ├── ai-insights.tsx               # AI-powered analysis (modal, Pro)
│   ├── privacy-policy/index.tsx      # Legal text
│   └── +not-found.tsx                # 404 fallback
├── components/
│   ├── ErrorBoundary.tsx             # App-wide crash boundary
│   ├── habits/
│   │   ├── HabitCard.tsx             # Habit row with checkbox, category badge, streak
│   │   ├── StreakRing.tsx            # Color-coded streak circle
│   │   └── HabitForm.tsx             # Modal form for creating habits
│   ├── journal/
│   │   └── JournalEntry.tsx          # Entry display component
│   ├── insights/
│   │   ├── PerformanceChart.tsx      # Bar chart (View-based)
│   │   ├── HabitCompletionChart.tsx  # 7-day heatmap grid
│   │   └── WeeklyReport.tsx          # Score card with delta indicators
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
│   └── mock-data.ts                  # Demo mode data (3 habits, 4 journals, 6 sessions)
├── hooks/
│   ├── useHabits.ts                  # Habit CRUD with optimistic updates + rollback
│   ├── useStreak.ts                  # Current/longest streak, completedToday
│   ├── useSubscription.ts            # Tier check, canAddHabit
│   └── usePerformanceScore.ts        # Weekly score computation with delta
├── store/
│   └── useAppStore.ts                # Zustand: session, profile, habits, error, loading
├── types/
│   └── index.ts                      # 7 interfaces: Profile, Habit, HabitCompletion, HabitWithCompletions, JournalEntry, FocusSession, PerformanceScore
├── constants/
│   └── Colors.ts                     # Dark theme palette + category colors
├── __tests__/
│   ├── science.test.ts               # 20 tests for science functions
│   └── date-utils.test.ts            # 6 tests for date utilities
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # All 6 tables, RLS policies, indexes
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

### 6 tables — all implemented in `supabase/migrations/001_initial_schema.sql`

```sql
-- 1. profiles — extends auth.users with app-specific data
-- 2. habits — habit definitions with science notes, category, frequency
-- 3. habit_completions — daily check-ins with optional quality rating (1-5)
-- 4. journal_entries — reflections with mood (1-5), energy (1-5), tags[]
-- 5. focus_sessions — timer records with type, duration, interruptions
-- 6. performance_scores — weekly aggregated scores (unique per user+week)
```

### Row Level Security
All tables have RLS enabled. Each table has per-operation policies (select, insert, update, delete) ensuring `auth.uid() = user_id`. See the migration file for full policy definitions.

### Indexes
Composite indexes on `(user_id, completed_at)` for habit completions and user-scoped indexes on all tables for fast lookups.

---

## Feature Flags (Free vs Pro)

Defined in `lib/features.ts`:

| Feature | Free | Pro |
|---|---|---|
| Habits | Max 3 | Unlimited |
| Journal | Yes | Yes |
| Focus timer | Yes | Yes |
| Basic streaks | Yes | Yes |
| AI insights | No | Yes |
| Performance analytics | No | Yes |
| Journal export | No | Yes |
| Advanced charts | No | Yes |
| Science protocols | Partial (4/7) | All 7 |
| Weekly report | No | Yes |

**Paywall trigger points:**
1. User tries to add a 4th habit
2. User taps "AI Insights" or "Insights" tab (free)
3. User tries to export journal
4. Locked protocols show lock icon

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
- [x] Zone 2 cardio (Voss et al., 2013)
- [x] Caffeine timing optimizer (Drake et al., 2013)

### Performance Score (weighted average):
- 40% habit completion rate (unique days / possible days)
- 30% focus score (total minutes / 600 target, capped at 100)
- 30% consistency (days with any activity / 7)

---

## Push Notifications

Implemented in `lib/notifications.ts` and `lib/ultradian-notifications.ts`:

| Type | Trigger | Implementation |
|---|---|---|
| Streak protection | 8 PM daily | `scheduleStreakReminder()` |
| Peak performance | 20 min before ultradian peak | `scheduleUltradianNotifications()` |
| Morning prime | User's wake time | `scheduleMorningPrime()` |

**Rule:** Max 2 notifications per day. Uses Expo Notifications only (OneSignal not integrated).

---

## RevenueCat Setup

Implemented in `lib/revenuecat.ts`:

```typescript
export const ENTITLEMENTS = { pro: 'pro_access' };
export const PRODUCT_IDS = {
  monthly: 'com.1000x.pro.monthly',    // $7.99/mo
  annual: 'com.1000x.pro.annual',      // $49.99/yr
  lifetime: 'com.1000x.lifetime',      // $79.99
};
```

Functions: `initRevenueCat()`, `checkProAccess()`, `getOfferings()`, `purchasePackage()`, `restorePurchases()`.

Platform-specific API keys via `EXPO_PUBLIC_RC_KEY_IOS` / `EXPO_PUBLIC_RC_KEY_ANDROID`.

---

## Supabase Edge Functions

### `/functions/performance-score`
Computes weekly scores server-side. Supports POST (single user) and cron (batch). Same formula as client-side hook.

### `/functions/weekly-report`
Sunday 8am cron. Generates current vs previous week delta, top habit, total focus time, and notification payload.

### `/functions/ai-insights`
Calls Claude Sonnet API with 30 days of anonymized user data. Returns 3-5 insights (observation/suggestion/correlation). Falls back to generic insights if API unavailable.

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
- **Science claims** — every in-app science reference must have a corresponding citation
- **Styling** — use `StyleSheet.create()` with colors from `constants/Colors.ts`
- **Demo mode** — handled entirely by the DataProvider context, not by `if (DEMO_MODE)` checks

---

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=        # Supabase project URL (empty = demo mode)
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
EXPO_PUBLIC_RC_KEY_IOS=          # RevenueCat iOS API key
EXPO_PUBLIC_RC_KEY_ANDROID=      # RevenueCat Android API key
```

When `EXPO_PUBLIC_SUPABASE_URL` is empty or undefined, the app runs in **demo mode** with mock data — no backend required.

---

## Development Status

### Phase 1 — MVP: COMPLETE
- [x] Expo project with Router + TypeScript strict mode
- [x] Supabase auth (email + Apple Sign-In)
- [x] Profiles table + auto-creation on first login
- [x] Habits CRUD (create, complete, delete) with optimistic updates
- [x] Streak calculation logic (current + longest)
- [x] Today dashboard with stats cards
- [x] Basic push notification (streak protection at 8 PM)
- [x] Demo mode with mock data

### Phase 2 — Core Features: COMPLETE
- [x] Journal entries with mood (1-5) + energy (1-5) tracking
- [x] Focus session timer (25/45/90 min presets, 4 session types, Pomodoro breaks)
- [x] RevenueCat paywall integration (3 plans, restore purchases)
- [x] Performance score v1 (weighted: 40% habits, 30% focus, 30% consistency)
- [x] Habit completion charts (7-day heatmap, performance bar chart, weekly report)
- [x] Feature flags + subscription gating
- [x] Privacy policy screen

### Phase 3 — Science Layer: IN PROGRESS
- [x] Science protocols screen (7 protocols with citations, free/pro gating)
- [x] Ultradian rhythm notifications (peak window reminders)
- [x] AI insights screen (Claude API via Edge Function, with fallback)
- [x] Performance score with week-over-week delta
- [x] DataProvider abstraction (Supabase + Mock implementations)
- [x] Error boundary + inline error banners
- [x] Unit tests for science functions (26 tests passing)
- [ ] Weekly performance report cron deployment
- [ ] Journal export (Pro feature)

### Phase 4 — Store Submission: NOT STARTED
- [ ] EAS Build configuration (profiles exist, project ID placeholder)
- [ ] App Store Connect setup + screenshots
- [ ] Google Play Console setup
- [ ] Host privacy policy at public URL
- [ ] TestFlight beta testing
- [ ] Production Supabase environment

---

## App Store Notes

- **Bundle ID:** `com.thousandx.app` (iOS + Android)
- **Category:** Health & Fitness
- **Age rating:** 4+
- **Privacy policy required:** Yes — screen exists at `/privacy-policy`, needs public URL hosting
- **Health claims:** Use "based on peer-reviewed research" — avoid "proven to" language
- **Subscription disclosure:** PaywallModal includes required Apple legal text (auto-renewal, cancellation terms)
- **Restore purchases:** Implemented in PaywallModal and Profile screen (required by Apple)
- **Apple Sign-In:** Enabled in `app.json` (required since the app offers it)

---

## Future Feature Backlog

```
[ ] HRV (Heart Rate Variability) tracking integration
[ ] Light exposure logging (circadian optimization)
[ ] Cold exposure / heat therapy tracker
[ ] VO2 max / Zone 2 cardio correlation
[ ] Sleep consistency score (not just duration)
[ ] Stress / recovery balance (training load model)
[ ] Social accountability features
[ ] Wearable integrations (Apple Health, Google Fit, Oura, Whoop)
[ ] AI journaling prompts (guided reflection)
[ ] Habit correlation engine ("Your focus score is 30% higher on days you exercise")
[ ] OneSignal integration for more reliable push delivery
[ ] Migrate StyleSheet to NativeWind/Tailwind classes
[ ] Error logging service (Sentry or similar)
[ ] Analytics tracking (Mixpanel, Amplitude)
[ ] Onboarding flow for new users
```

---

## Key Commands

```bash
# Development
npm start                    # Expo dev server
npm run ios                  # Open iOS simulator
npm run android              # Open Android emulator
npm run typecheck            # TypeScript validation
npm test                     # Run Jest test suite (26 tests)

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
