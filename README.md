# 1000x

A science-backed productivity and performance app for iOS and Android. Track habits, journal, run focus sessions, and view performance analytics — all grounded in peer-reviewed research (ultradian rhythms, spacing effect, circadian performance peaks, etc.).

## Tech Stack

- **Framework:** React Native + Expo (SDK 55) with Expo Router
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **Subscriptions:** RevenueCat
- **Styling:** NativeWind (Tailwind CSS for RN)
- **State:** Zustand
- **Charts:** Victory Native
- **Animations:** React Native Reanimated

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

# Push database migrations
npm run db:push

# Start development server
npm start
```

### Environment Variables

Create a `.env.local` file with:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RC_KEY_IOS=
EXPO_PUBLIC_RC_KEY_ANDROID=
EXPO_PUBLIC_ONESIGNAL_APP_ID=
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run build:ios` | Production build for App Store (EAS) |
| `npm run build:android` | Production build for Play Store (EAS) |
| `npm run db:push` | Push Supabase migrations |
| `npm run deploy:functions` | Deploy Supabase Edge Functions |

## Project Structure

```
app/              # Expo Router screens (auth, tabs, layout)
components/       # UI components (habits, focus, journal, insights)
hooks/            # Custom React hooks for data fetching
lib/              # Supabase client, RevenueCat, science calculations
store/            # Zustand global state
types/            # Shared TypeScript types
supabase/         # Migrations and Edge Functions
```

## License

Private — all rights reserved.
