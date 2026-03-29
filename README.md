# Summis

**The Science of Cognitive Performance**

A science-backed cognitive performance coach for iOS and Android. Focus sprints, cognitive hygiene tracking, and a correlation engine that proves which practices actually improve your focus — built on Dr. Sahar Yousef's Becoming Superhuman framework and the Brain Drain study (Ward et al., 2017).

## What Makes Summis Different

Every digital wellness app measures inputs (less screen time). Summis measures **outputs** (did your focus actually improve?) and connects the two. After 30 days, you don't just believe you should put your phone away — you have **personalized proof** that it works.

## Features

- **Focus Sprints** — 4-phase Yousef protocol: set intention → deep focus (30/45/50 min) → genuine rest → reflection. DND integration during sprints.
- **Cognitive Hygiene Tracking** — Track phone placement, notification management, environment setup, and more. Daily compliance scoring.
- **Most Important Tasks (MITs)** — Set 3 MITs each morning. Link them to sprints. Track completion.
- **Correlation Engine** (Pro) — Pearson correlation analysis proving which hygiene practices improve your focus quality. "Your focus is 23% higher on days you keep your phone in another room."
- **Chronotype-Aware Coaching** — AM-Shifted / Bi-Phasic / PM-Shifted energy models. Sprint scheduling aligned to your peak windows.
- **Cognitive Performance Score** — Weighted composite: sprint completion (30%), focus quality (30%), hygiene compliance (25%), MIT completion (15%).
- **AI Insights** (Pro) — Claude-powered personalized analysis from your sprint and hygiene data.
- **Science Protocols** — Curated routines with peer-reviewed citations.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React Native + Expo (SDK 55), Expo Router |
| Language | TypeScript (strict mode) |
| Backend | Supabase (Auth, Postgres, Edge Functions) |
| Subscriptions | RevenueCat |
| State | Zustand |
| Charts | Victory Native + custom View-based charts |
| Animations | React Native Reanimated |
| Testing | Jest (206 tests across 17 suites) |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for backend)
- iOS Simulator (macOS) or Android Emulator

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your keys
cp .env.example .env.local

# Push database migrations (16 migration files)
npm run db:push

# Deploy edge functions
npm run deploy:functions

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
| `npm test` | Run Jest test suite (206 tests) |
| `npm run build:ios` | Production build for App Store (EAS) |
| `npm run build:android` | Production build for Play Store (EAS) |
| `npm run db:push` | Push Supabase migrations |
| `npm run deploy:functions` | Deploy Supabase Edge Functions |

## Project Structure

```
app/              # Expo Router screens (auth, onboarding, 3 tabs, modals)
components/       # UI components (sprint, today, score, onboarding, ui)
hooks/            # Custom hooks (useSprints, useMITs, useHygieneScore, etc.)
lib/              # Core logic (sprint-protocol, hygiene-engine, chronotype-engine,
                  #   correlation-engine, data-provider, features, date-utils)
store/            # Zustand global state
types/            # TypeScript types (index.ts + summis.ts)
constants/        # Colors, Spacing, Typography
supabase/         # Migrations (16) and Edge Functions (4)
__tests__/        # Jest tests (17 suites, 206 tests)
```

## Database

16 migrations covering:
- Core tables: profiles, sprints, mits, hygiene_configs, hygiene_logs
- Legacy tables: habits, habit_completions, journal_entries, focus_sessions (kept for data migration)
- Supporting: performance_scores, daily_scores, daily_plans
- Constraints: text length limits, enum validation, RLS on all tables

## Subscription Plans

| Plan | Price | Features |
|---|---|---|
| Free | $0 | 3 sprints/day, MITs, 3 hygiene practices, basic score |
| Pro Monthly | $7.99/mo | Unlimited sprints, correlation insights, AI insights, trend analysis, all protocols |
| Pro Annual | $49.99/yr | Same as Pro (~48% savings) |
| Lifetime | $79.99 | Permanent Pro access |

## Research Foundation

- **Ward, Duke, Gneezy & Bos (2017)** — "Brain Drain: The Mere Presence of One's Own Smartphone Reduces Available Cognitive Capacity"
- **Bailenson (2021)** — "Nonverbal Overload: A Theoretical Argument for the Causes of Zoom Fatigue"
- **Dr. Sahar Yousef** — "Becoming Superhuman" curriculum, UC Berkeley Haas School of Business

## License

Private — all rights reserved.
