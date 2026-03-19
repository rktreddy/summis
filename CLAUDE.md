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

| Layer | Tool | Notes |
|---|---|---|
| Framework | React Native + Expo (SDK 52+) | Use Expo Router for file-based navigation |
| Backend | Supabase | Auth, Postgres DB, Realtime, Edge Functions |
| Subscriptions | RevenueCat | Handles App Store + Play Store billing |
| Push notifications | Expo Notifications + OneSignal | Science-triggered reminders |
| Charts | Victory Native | Performance graphs, streak trends |
| Animations | React Native Reanimated 3 | Streak celebrations, progress rings |
| State management | Zustand | Lightweight, simple |
| Forms | React Hook Form + Zod | Validated inputs |
| Styling | NativeWind (Tailwind for RN) | Consistent design tokens |

---

## Project Structure

```
1000x/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx             # Dashboard / Today view
│   │   ├── habits.tsx            # Habit tracker
│   │   ├── journal.tsx           # Journal entries
│   │   ├── focus.tsx             # Focus session timer
│   │   ├── insights.tsx          # Performance analytics (Pro)
│   │   └── profile.tsx           # Settings, subscription
│   └── _layout.tsx
├── components/
│   ├── habits/
│   │   ├── HabitCard.tsx
│   │   ├── StreakRing.tsx
│   │   └── HabitForm.tsx
│   ├── focus/
│   │   ├── FocusTimer.tsx
│   │   └── SessionSummary.tsx
│   ├── journal/
│   │   └── JournalEntry.tsx
│   ├── insights/
│   │   ├── PerformanceChart.tsx
│   │   └── WeeklyReport.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── PaywallModal.tsx
│       └── ProgressRing.tsx
├── lib/
│   ├── supabase.ts               # Supabase client init
│   ├── revenuecat.ts             # RevenueCat init + hooks
│   ├── notifications.ts          # Notification scheduling logic
│   └── science.ts                # Science-based calculations (ultradian, etc.)
├── hooks/
│   ├── useHabits.ts
│   ├── useStreak.ts
│   ├── useSubscription.ts
│   └── usePerformanceScore.ts
├── store/
│   └── useAppStore.ts            # Zustand global state
├── types/
│   └── index.ts                  # Shared TypeScript types
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── functions/                # Edge Functions
│       ├── weekly-report/
│       └── performance-score/
└── assets/
    ├── fonts/
    └── images/
```

---

## Database Schema (Supabase / Postgres)

### Core tables — implement in this order

```sql
-- 1. Users (extended from Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  display_name text,
  timezone text default 'UTC',
  onboarding_completed boolean default false,
  subscription_tier text default 'free', -- 'free' | 'pro' | 'lifetime'
  created_at timestamptz default now()
);

-- 2. Habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  science_note text,              -- e.g. "Based on the 21-day habit formation research"
  category text,                  -- 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness'
  frequency text default 'daily', -- 'daily' | 'weekdays' | 'custom'
  target_time time,               -- suggested time of day
  color text,
  icon text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. Habit completions
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  note text,
  quality_rating int check (quality_rating between 1 and 5) -- optional self-rating
);

-- 4. Journal entries
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  mood int check (mood between 1 and 5),
  energy_level int check (energy_level between 1 and 5),
  tags text[],
  created_at timestamptz default now()
);

-- 5. Focus sessions
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  duration_minutes int not null,
  session_type text default 'deep_work', -- 'deep_work' | 'study' | 'creative' | 'admin'
  completed boolean default false,
  interruptions int default 0,
  quality_rating int check (quality_rating between 1 and 5),
  notes text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- 6. Performance scores (computed weekly)
create table public.performance_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  overall_score int,              -- 0-100
  habit_score int,
  focus_score int,
  consistency_score int,
  computed_at timestamptz default now(),
  unique(user_id, week_start)
);
```

### Row Level Security — enable on all tables
```sql
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.performance_scores enable row level security;

-- Pattern: users can only access their own data
create policy "Users own their data" on public.habits
  for all using (auth.uid() = user_id);
-- Repeat for each table above
```

---

## Feature Flags (Free vs Pro)

```typescript
// lib/features.ts
export const FEATURES = {
  // Free tier
  habits_limit: 3,               // Free users: max 3 habits
  journal: true,
  focus_timer: true,
  basic_streaks: true,

  // Pro tier
  habits_unlimited: 'pro',
  ai_insights: 'pro',
  performance_analytics: 'pro',
  journal_export: 'pro',
  advanced_charts: 'pro',
  science_protocols: 'pro',      // Curated science-backed programs
  weekly_report: 'pro',
} as const;
```

---

## Science Layer — Key Concepts to Implement

This is what differentiates 1000x from generic habit apps. Build these calculations in `lib/science.ts`:

```typescript
// Ultradian rhythm — ~90 min focus cycles
export function getNextPeakWindow(lastSleepTime: Date): Date { ... }

// Circadian alertness — performance peaks ~2-4 hrs after waking
export function getAlertnessPeak(wakeTime: Date): { peak: Date; window: number } { ... }

// Habit stacking score — rewards clustering habits together
export function calculateHabitStackScore(completions: HabitCompletion[]): number { ... }

// Consistency score — weighted recent vs historical (recency bias)
export function calculateConsistencyScore(completions: HabitCompletion[], days: number): number { ... }
```

**Science protocols to add over time (placeholders for future features):**
- [ ] 90-minute ultradian focus blocks
- [ ] 2-minute rule (BJ Fogg's Tiny Habits)
- [ ] Spaced repetition for skill learning
- [ ] Morning priming protocol (HRV, cold exposure, sunlight)
- [ ] Sleep optimization tracking (consistency > duration)
- [ ] Zone 2 cardio correlation with cognitive performance

---

## Push Notification Strategy

Use `lib/notifications.ts` to schedule these. Always give users full control to customize or disable.

```typescript
// Notification types for 1000x
type NotificationTrigger =
  | 'streak_protection'      // "Don't break your 14-day streak — 2 habits left today"
  | 'peak_performance'       // "Your focus window opens in 20 min"
  | 'morning_prime'          // "Good morning — today's science protocol is ready"
  | 'weekly_digest'          // Sunday summary with performance score
  | 'habit_reminder'         // Per-habit custom reminder
  | 'milestone'              // "You've hit a 30-day streak!"
```

**Key rule:** Never send more than 2 notifications per day. Science framing in copy always beats generic reminders.

---

## RevenueCat Setup

```typescript
// lib/revenuecat.ts
import Purchases, { CustomerInfo } from 'react-native-purchases';

export const ENTITLEMENTS = {
  pro: 'pro_access',
};

export const PRODUCT_IDS = {
  monthly: 'com.1000x.pro.monthly',    // $7.99/mo
  annual: 'com.1000x.pro.annual',      // $49.99/yr (~48% savings)
  lifetime: 'com.1000x.lifetime',      // $79.99 one-time
};

// Initialize in app/_layout.tsx on app start
export async function initRevenueCat(userId: string) {
  await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_KEY! });
  await Purchases.logIn(userId);
}
```

**Paywall trigger points:**
1. User tries to add a 4th habit (free limit)
2. User taps "AI Insights" tab
3. User tries to export journal
4. After completing a 7-day streak (emotion is high — best conversion moment)

---

## Supabase Edge Functions

### `/functions/performance-score`
Runs weekly (cron) or on-demand. Computes overall score from:
- Habit completion rate (last 7 days)
- Focus session count + avg duration
- Journal consistency
- Streak lengths

### `/functions/weekly-report`
Triggered every Sunday at 8am user local time. Generates:
- Performance score delta vs prior week
- Top habit of the week
- Focus time total
- Push notification payload for OneSignal

---

## Coding Conventions

- **TypeScript strict mode** — always. No `any`.
- **Component files** — one component per file, named exports
- **Hooks** — all data fetching via custom hooks in `/hooks`, never directly in components
- **Supabase queries** — always use `.select()` with explicit columns, never `select('*')` in production
- **Error handling** — all async operations wrapped in try/catch, errors surfaced via toast or inline UI
- **Accessibility** — all touchable elements have `accessibilityLabel`
- **Science claims** — every in-app science reference must have a corresponding citation in `lib/science.ts`

---

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RC_KEY_IOS=
EXPO_PUBLIC_RC_KEY_ANDROID=
EXPO_PUBLIC_ONESIGNAL_APP_ID=
```

---

## Development Phases

### Phase 1 — MVP (Weeks 1–3)
- [ ] Expo project init with Router + NativeWind
- [ ] Supabase auth (email + Apple Sign-In)
- [ ] Profiles table + onboarding flow
- [ ] Habits CRUD (create, complete, delete)
- [ ] Streak calculation logic
- [ ] Today dashboard screen
- [ ] Basic push notification (streak protection)

### Phase 2 — Core features (Weeks 4–5)
- [ ] Journal entries with mood + energy tracking
- [ ] Focus session timer (Pomodoro + custom)
- [ ] RevenueCat paywall integration
- [ ] Performance score v1 (simple calculation)
- [ ] Habit completion charts (Victory Native)

### Phase 3 — Science layer (Weeks 6–7)
- [ ] Science protocols screen
- [ ] Ultradian rhythm notifications
- [ ] Weekly performance report (Edge Function)
- [ ] AI insights screen (calls Claude API via Edge Function)
- [ ] Journal export (Pro)

### Phase 4 — Store submission (Week 8)
- [ ] EAS Build configuration
- [ ] App Store Connect setup + screenshots
- [ ] Google Play Console setup
- [ ] Privacy policy page (required)
- [ ] Restore purchases button (required by Apple)
- [ ] TestFlight beta

---

## App Store Notes

- **Category:** Health & Fitness
- **Age rating:** 4+
- **Privacy policy required:** Yes — host at a URL before submitting
- **Health claims:** Use "based on peer-reviewed research" — avoid "proven to" language
- **Subscription disclosure:** Apple requires clear display of subscription price, duration, and cancellation terms on the paywall screen

---

## Future Feature Backlog (Research-driven additions)

Add new science protocols here as you research them. Each becomes a potential premium feature.

```
[ ] HRV (Heart Rate Variability) tracking integration
[ ] Light exposure logging (circadian optimization)
[ ] Cold exposure / heat therapy tracker
[ ] VO2 max / Zone 2 cardio correlation
[ ] Caffeine timing optimizer (based on adenosine half-life)
[ ] Sleep consistency score (not just duration)
[ ] Stress / recovery balance (training load model)
[ ] Social accountability features
[ ] Wearable integrations (Apple Health, Google Fit, Oura, Whoop)
[ ] AI journaling prompts (guided reflection)
[ ] Habit correlation engine ("Your focus score is 30% higher on days you exercise")
```

---

## Key Commands

```bash
# Start development
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for App Store (EAS)
eas build --platform ios --profile production

# Build for Play Store (EAS)
eas build --platform android --profile production

# Push Supabase migration
supabase db push

# Deploy Edge Function
supabase functions deploy performance-score
```
