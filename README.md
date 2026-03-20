# 1000x

A science-backed productivity and performance app for iOS and Android. Track habits, journal, run focus sessions, and view performance analytics — all grounded in peer-reviewed research (ultradian rhythms, spacing effect, circadian performance peaks, etc.).

## Features

- **Onboarding Goal Quiz** — Choose your #1 goal (Focus, Sleep, Fitness, General) and get 3 pre-loaded science-backed habits
- **Habit Tracking** — Pick a category, choose from suggestions or create your own, set Easy/Moderate/Hard difficulty. Track streaks, get milestone celebrations at 7/14/30/60/100 days. Soft delete preserves history
- **Focus Timer** — Pomodoro-style timer (25/45/90 min) with deep work, study, creative, and admin modes. Interruption type logging (Phone/Person/Thought/Other)
- **Journaling** — Daily reflections with mood (1-5) and energy (1-5) ratings. Pro users can export all entries as formatted text
- **Performance Insights** (Pro) — Difficulty-weighted scoring, weekly reports with deltas, 7-day heatmaps
- **Habit Correlation Engine** (Pro) — Pearson correlation analysis showing which habits impact your performance most
- **AI Insights** (Pro) — Claude-powered personalized analysis from 30 days of data
- **Science Protocols** — 7 curated routines with peer-reviewed citations
- **Streak Sharing** — Branded share cards at milestone streaks via native share sheet

## Tech Stack

- **Framework:** React Native + Expo (SDK 55) with Expo Router
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **Subscriptions:** RevenueCat
- **State:** Zustand
- **Charts:** Victory Native + custom View-based charts
- **Animations:** React Native Reanimated
- **Testing:** Jest (37 tests)

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)
- iOS Simulator (macOS) or Android Emulator

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your keys
cp .env.example .env.local

# Push database migrations (5 migration files)
npm run db:push

# Start development server
npm start
```

### Demo Mode

Leave `EXPO_PUBLIC_SUPABASE_URL` empty in `.env.local` to run in demo mode with mock data — no backend required.

### Environment Variables

Create a `.env.local` file with:

```
EXPO_PUBLIC_SUPABASE_URL=          # Supabase project URL (empty = demo mode)
EXPO_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
EXPO_PUBLIC_RC_KEY_IOS=            # RevenueCat iOS API key
EXPO_PUBLIC_RC_KEY_ANDROID=        # RevenueCat Android API key
EXPO_PUBLIC_ONESIGNAL_APP_ID=      # OneSignal App ID (optional)
EXPO_PUBLIC_SENTRY_DSN=            # Sentry DSN (optional)
EXPO_PUBLIC_MIXPANEL_TOKEN=        # Mixpanel token (optional)
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Jest test suite (37 tests) |
| `npm run build:ios` | Production build for App Store (EAS) |
| `npm run build:android` | Production build for Play Store (EAS) |
| `npm run db:push` | Push Supabase migrations |
| `npm run deploy:functions` | Deploy Supabase Edge Functions |

## Project Structure

```
app/              # Expo Router screens (auth, onboarding, tabs, modals)
components/       # UI components (habits, focus, journal, insights, onboarding, social)
hooks/            # Custom React hooks for data fetching
lib/              # Supabase client, RevenueCat, science calculations, correlation engine
store/            # Zustand global state
types/            # Shared TypeScript types
supabase/         # Migrations (5) and Edge Functions (3)
__tests__/        # Jest tests (science, date-utils, correlation-engine)
```

## Database Migrations

| File | Description |
|---|---|
| `001_initial_schema.sql` | 6 tables: profiles, habits, habit_completions, journal_entries, focus_sessions, performance_scores |
| `002_onboarding_goals.sql` | Adds `user_goal` column to profiles |
| `003_habit_difficulty.sql` | Adds `difficulty` column to habits |
| `004_interruption_types.sql` | Adds `interruption_types[]` to focus_sessions |
| `005_daily_scores.sql` | New `daily_scores` table for correlation engine |

## Subscription Plans

| Plan | Price | Features |
|---|---|---|
| Free | $0 | Up to 5 habits, journal, focus timer, basic streaks, 3 protocols |
| Pro Monthly | $7.99/mo | Unlimited habits, AI insights, analytics, correlation engine, all protocols |
| Pro Annual | $49.99/yr | Same as Pro (~48% savings) |
| Lifetime | $79.99 | Permanent Pro access |

## License

Private — all rights reserved.
