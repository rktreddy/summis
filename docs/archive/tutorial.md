# 1000x App — A Complete Beginner's Tutorial

Welcome! This tutorial walks you through the entire **1000x** codebase — a science-backed productivity app built with React Native and Expo. If you've never built a mobile app before, this guide is for you. By the end, you'll understand every major piece of the project and how they fit together.

---

## Table of Contents

1. [What Does This App Do?](#1-what-does-this-app-do)
2. [Technology Summary](#2-technology-summary)
3. [High-Level Architecture Walkthrough](#3-high-level-architecture-walkthrough)
4. [Detailed Code Review](#4-detailed-code-review)
   - [4.1 Project Configuration](#41-project-configuration)
   - [4.2 TypeScript Types — The Data Dictionary](#42-typescript-types--the-data-dictionary)
   - [4.3 Database Schema](#43-database-schema)
   - [4.4 The Supabase Client — Connecting to the Backend](#44-the-supabase-client--connecting-to-the-backend)
   - [4.5 The Root Layout — Where Everything Starts](#45-the-root-layout--where-everything-starts)
   - [4.6 State Management with Zustand](#46-state-management-with-zustand)
   - [4.7 Navigation — Tabs and Screens](#47-navigation--tabs-and-screens)
   - [4.8 Authentication — Login and Signup](#48-authentication--login-and-signup)
   - [4.9 Custom Hooks — Reusable Logic](#49-custom-hooks--reusable-logic)
   - [4.10 UI Components — Building Blocks](#410-ui-components--building-blocks)
   - [4.11 The Today Dashboard — Bringing It All Together](#411-the-today-dashboard--bringing-it-all-together)
   - [4.12 The Focus Timer — A Complete Feature](#412-the-focus-timer--a-complete-feature)
   - [4.13 The Science Layer](#413-the-science-layer)
   - [4.14 Subscriptions and the Paywall](#414-subscriptions-and-the-paywall)
   - [4.15 Feature Flags](#415-feature-flags)
   - [4.16 Styling and Theming](#416-styling-and-theming)
5. [Suggestions for Improvement](#5-suggestions-for-improvement)

---

## 1. What Does This App Do?

1000x is a mobile app (iOS and Android) that helps people build better habits, focus more deeply, journal their thoughts, and understand their productivity patterns — all backed by real scientific research. Think of it as a personal coach that uses evidence-based techniques like ultradian rhythms (your brain's natural 90-minute focus cycles) and habit stacking.

**Core features:**
- **Habit Tracking** — Create habits, mark them complete each day, track streaks
- **Focus Timer** — Pomodoro-style timer with deep work, study, creative, and admin modes
- **Journaling** — Write daily reflections with mood and energy ratings
- **Performance Insights** — Charts and scores showing your productivity trends (Pro feature)
- **Science Protocols** — Curated routines based on peer-reviewed research

**Business model:** The app is free with limits (max 5 habits). Users can upgrade to Pro ($7.99/month, $49.99/year, or $79.99 lifetime) for unlimited habits, AI insights, correlation engine, and analytics.

**Recent additions:**
- **Onboarding goal quiz** — new users choose a performance goal and get 3 pre-loaded science-backed habits
- **Habit difficulty** — Easy/Moderate/Hard levels that weight your performance score
- **Interruption logging** — when you pause a focus session, log what distracted you (Phone/Person/Thought/Other)
- **Streak milestones** — shareable celebration cards at 7, 14, 30, 60, and 100 day streaks
- **Correlation engine** — after 30+ days, shows which habits most impact your performance (Pearson analysis)

---

## 2. Technology Summary

If you're new to app development, here's what each technology does and why we chose it:

### React Native + Expo
**What it is:** React Native lets you build mobile apps using JavaScript/TypeScript instead of writing separate code for iOS (Swift) and Android (Kotlin). Expo is a toolkit that makes React Native easier — it handles builds, updates, and device features (camera, notifications, etc.) so you don't have to configure them manually.

**Why we use it:** Write one codebase, get apps on both platforms. Expo removes the headaches of native setup.

### TypeScript
**What it is:** TypeScript is JavaScript with "types" — labels that describe what kind of data a variable holds (a string, a number, an array, etc.). The compiler catches mistakes before your app even runs.

**Why we use it:** Catches bugs early. If you try to pass a number where a string is expected, TypeScript tells you immediately instead of crashing at runtime.

### Supabase
**What it is:** Supabase is an open-source backend-as-a-service. It gives you a PostgreSQL database, user authentication, file storage, and serverless functions — all managed for you through a web dashboard.

**Why we use it:** No need to build and deploy your own server. You get a production-grade database with user login out of the box.

### Zustand
**What it is:** A state management library for React. "State" is any data your app needs to remember (the current user, their habits, whether something is loading). Zustand provides a single "store" where this data lives and any component can read from it.

**Why we use it:** Much simpler than alternatives like Redux. A Zustand store is about 20 lines of code.

### RevenueCat
**What it is:** A service that manages in-app subscriptions. Apple and Google have complex billing APIs — RevenueCat wraps them into a simple SDK so you can offer subscriptions without dealing with receipt validation, refund handling, etc.

**Why we use it:** Subscription management is notoriously complex. RevenueCat handles the hard parts.

### NativeWind (Tailwind CSS for React Native)
**What it is:** Lets you use Tailwind CSS utility classes in React Native. Instead of writing `{ padding: 20, borderRadius: 12 }`, you write `className="p-5 rounded-xl"`.

**Why we use it:** Faster styling with consistent design tokens.

### Other Libraries
| Library | Purpose |
|---|---|
| **Expo Router** | File-based navigation — each file in `app/` becomes a screen |
| **React Hook Form + Zod** | Form handling and input validation |
| **Victory Native** | Charts and data visualization |
| **React Native Reanimated** | Smooth, performant animations |

---

## 3. High-Level Architecture Walkthrough

Here's how data flows through the app, from the user's phone to the database and back:

```
┌─────────────────────────────────────────────────────────┐
│                     User's Phone                         │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │  Screens  │──▶│  Hooks   │──▶│  Store   │            │
│  │ (app/)    │   │(hooks/)  │   │(Zustand) │            │
│  │           │◀──│          │◀──│          │            │
│  └──────────┘   └──────────┘   └──────────┘            │
│       │              │                                   │
│       │              ▼                                   │
│       │        ┌──────────┐                              │
│       │        │   Lib    │                              │
│       │        │(supabase,│                              │
│       │        │ science) │                              │
│       │        └──────────┘                              │
│       │              │                                   │
└───────│──────────────│───────────────────────────────────┘
        │              │
        │              ▼
  ┌─────────────────────────────┐
  │        Supabase Cloud       │
  │  ┌───────┐  ┌────────────┐  │
  │  │ Auth  │  │  Postgres  │  │
  │  │       │  │  Database  │  │
  │  └───────┘  └────────────┘  │
  │  ┌───────────────────────┐  │
  │  │    Edge Functions     │  │
  │  │ (AI, reports, scores) │  │
  │  └───────────────────────┘  │
  └─────────────────────────────┘
```

**The flow in plain English:**

1. **Screens** are what the user sees and taps on. They live in the `app/` directory.
2. Screens don't talk to the database directly. Instead, they call **hooks** — reusable functions that contain the logic for fetching, creating, and updating data.
3. Hooks read from and write to the **Zustand store** — a central place that holds the app's current state (who's logged in, what habits exist, etc.).
4. Hooks also use **library functions** in `lib/` to talk to Supabase (the database) and to do science-based calculations.
5. **Supabase** handles authentication (login/signup), stores all data in a PostgreSQL database, and runs server-side functions (Edge Functions) for things like computing weekly performance scores.

**Key architectural principle:** Screens are "dumb" — they just display data and capture user input. All the smart logic lives in hooks and lib files. This separation makes the code easier to test and maintain.

---

## 4. Detailed Code Review

### 4.1 Project Configuration

Before any code runs, several configuration files tell the tools how to build and run the app.

**`package.json`** — This is the app's manifest. It lists every dependency (library) the project uses and defines scripts (shortcut commands).

```json
{
  "name": "thousandx",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "typecheck": "tsc --noEmit"
  }
}
```

- `"main": "expo-router/entry"` tells Expo to use file-based routing. Every `.tsx` file inside `app/` automatically becomes a navigable screen.
- `"typecheck": "tsc --noEmit"` runs the TypeScript compiler to check for errors without producing output files.

**`tsconfig.json`** configures TypeScript. The important setting is:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

- `"strict": true` enables all TypeScript safety checks. This catches more bugs but requires you to be explicit about types.
- The `@/*` path alias means you can write `import { supabase } from '@/lib/supabase'` instead of the fragile `'../../../lib/supabase'`.

---

### 4.2 TypeScript Types — The Data Dictionary

**File: `types/index.ts`**

Before you look at any feature code, understand the data shapes. This file defines every data structure the app uses:

```typescript
export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  onboarding_completed: boolean;
  user_goal: 'focus' | 'sleep' | 'fitness' | 'general' | null;
  subscription_tier: 'free' | 'pro' | 'lifetime';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  science_note: string | null;
  category: 'focus' | 'sleep' | 'exercise' | 'nutrition' | 'mindfulness' | null;
  frequency: 'daily' | 'weekdays' | 'custom';
  target_time: string | null;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  note: string | null;
  quality_rating: number | null;
}
```

**Key concepts for beginners:**

- `interface` is TypeScript's way of saying "any object of this type must have these fields."
- `string | null` means the field can be either a string or null (missing). Fields like `description` are optional — not every habit has one.
- `'free' | 'pro' | 'lifetime'` is a "union type" — the value must be one of these exact strings. This prevents typos like `'proo'` from compiling.
- `HabitWithCompletions extends Habit` means it has all of Habit's fields plus `completions` and `currentStreak`. This is how we attach calculated data to a habit.

These types act as a contract: every function that returns a `Habit` must include all these fields. If the database schema changes and you forget to update the code, TypeScript will flag it.

---

### 4.3 Database Schema

**File: `supabase/migrations/001_initial_schema.sql`**

This SQL file creates all the tables in the PostgreSQL database. Let's examine the key parts:

```sql
-- Users (extended from Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  display_name text,
  timezone text default 'UTC',
  onboarding_completed boolean default false,
  subscription_tier text default 'free',
  created_at timestamptz default now()
);
```

- `id uuid references auth.users primary key` — The profile's ID is a UUID (universally unique identifier) that references Supabase's built-in auth system. When someone signs up, Supabase creates a record in `auth.users`; our `profiles` table extends it with app-specific data.
- `default 'free'` — New users start on the free tier automatically.

```sql
-- Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  category text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);
```

- `on delete cascade` — If a user's profile is deleted, all their habits are automatically deleted too. This prevents orphaned data.
- `gen_random_uuid()` — The database generates unique IDs automatically.

**Row Level Security (RLS)** is critical for a multi-user app:

```sql
alter table public.habits enable row level security;

create policy "Users read their habits" on public.habits
  for select using (auth.uid() = user_id);

create policy "Users insert their habits" on public.habits
  for insert with check (auth.uid() = user_id);
```

RLS means that even if someone crafts a malicious API request, they can only see and modify their own data. The database itself enforces this — it's not just a frontend check that could be bypassed.

**Indexes** speed up common queries:

```sql
create index if not exists idx_habit_completions_user_completed
  on public.habit_completions(user_id, completed_at);
```

This composite index makes "fetch all completions for user X in the last 30 days" fast, because the database can jump directly to the right rows instead of scanning every record.

---

### 4.4 The Supabase Client — Connecting to the Backend

**File: `lib/supabase.ts`**

This file creates the Supabase client that every other file uses to talk to the database:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch {
        return null;
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch {
        console.warn('Failed to persist auth session to localStorage');
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch {
        // localStorage blocked
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**What's happening here:**

1. **Environment variables** (`process.env.EXPO_PUBLIC_SUPABASE_URL`) store sensitive values outside the code. These are set in a `.env.local` file that is never committed to git. The `|| 'placeholder...'` fallback enables a "demo mode" when no credentials are set.

2. **The SecureStore adapter** is interesting. Supabase needs to save the user's login session somewhere so they don't have to log in every time they open the app. On a phone, `expo-secure-store` uses the device's encrypted keychain (the same place your passwords are stored). On the web, it falls back to `localStorage`. This adapter bridges that gap.

3. **`detectSessionInUrl: false`** is necessary because React Native doesn't have browser URLs. Without this flag, Supabase would try to look for an OAuth callback in the URL, which doesn't exist in a mobile app.

---

### 4.5 The Root Layout — Where Everything Starts

**File: `app/_layout.tsx`**

This is the first file that runs when the app opens. It handles authentication, loads fonts, and decides which screen to show:

```typescript
const DEMO_MODE = process.env.EXPO_PUBLIC_SUPABASE_URL === undefined
  || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(
  session: { user: { id: string } } | null,
  profile: { onboarding_completed: boolean } | null
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // After login, check if onboarding is needed
      if (profile && !profile.onboarding_completed) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && profile && !profile.onboarding_completed && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [session, profile, segments]);
}
```

**Breaking this down:**

1. **`DEMO_MODE`** — If no Supabase URL is configured, the app uses fake data instead of a real database. This is great for development and demos.

2. **`SplashScreen.preventAutoHideAsync()`** — Keeps the splash screen visible while the app loads fonts and checks if the user is logged in. Without this, the user would see a blank screen for a moment.

3. **`useProtectedRoute`** is a navigation guard. It uses Expo Router's `useSegments()` to check which screen group the user is currently in:
   - Not logged in but trying to access a tab? Redirect to login.
   - Logged in but still on the login screen? Redirect to the main app.

The main `RootLayout` component then initializes everything:

```typescript
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { session, setSession, setProfile, setHabits } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      setSession({ user: { id: MOCK_PROFILE.id } });
      setProfile(MOCK_PROFILE);
      setHabits(MOCK_HABITS);
      setIsReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
        initRevenueCat(s.user.id).catch(console.warn);
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);
  // ...
}
```

**Key patterns:**

- **`useEffect(() => { ... }, [])`** — The empty `[]` dependency array means this runs once when the component first mounts. This is where initialization happens.
- **`onAuthStateChange`** — Supabase fires this callback whenever the user logs in or out. The app responds by updating the store.
- **`return () => subscription.unsubscribe()`** — Cleanup function. When the component unmounts, it stops listening for auth changes. This prevents memory leaks.
- **`fetchProfile`** either retrieves the user's profile from the database or creates one if it doesn't exist yet (first login). Notice the explicit column selection: `.select('id, display_name, timezone, ...')` — the project never uses `select('*')` because fetching unnecessary columns wastes bandwidth.

---

### 4.6 State Management with Zustand

**File: `store/useAppStore.ts`**

This file is the app's "brain" — a central place that holds all shared data:

```typescript
import { create } from 'zustand';
import type { Profile, HabitCompletion, HabitWithCompletions } from '@/types';

interface AppState {
  session: { user: { id: string } } | null;
  profile: Profile | null;
  setSession: (session: AppState['session']) => void;
  setProfile: (profile: Profile | null) => void;

  habits: HabitWithCompletions[];
  setHabits: (habits: HabitWithCompletions[]) => void;
  addHabit: (habit: HabitWithCompletions) => void;
  removeHabit: (id: string) => void;
  updateHabitCompletions: (habitId: string, completions: HabitCompletion[], streak: number) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  habits: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  removeHabit: (id) =>
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  updateHabitCompletions: (habitId, completions, streak) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, completions, currentStreak: streak } : h
      ),
    })),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
```

**How Zustand works:**

1. `create<AppState>((set) => ({ ... }))` creates a store. The `set` function is how you update state.
2. Each field (`session`, `profile`, `habits`) is a piece of state. Each `set...` function is an action that updates it.
3. **Any component** can read from the store: `const profile = useAppStore((s) => s.profile)`. The `(s) => s.profile` selector means the component only re-renders when `profile` changes, not when other state changes. This is important for performance.
4. `addHabit` shows an immutable update pattern: `set((state) => ({ habits: [habit, ...state.habits] }))`. It creates a new array with the new habit prepended, rather than mutating the existing array. React requires this to detect changes.

**Why not just use React's `useState`?** If the user's session lived in `_layout.tsx` with `useState`, you'd have to pass it down through every component as a prop. Zustand lets any component anywhere in the tree access it directly.

---

### 4.7 Navigation — Tabs and Screens

**File: `app/(tabs)/_layout.tsx`**

Expo Router uses a file-system convention. Folders in parentheses like `(tabs)` create "groups" — they organize screens without adding to the URL path. This file configures the bottom tab bar:

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon name="today-outline" color={color} />,
        }}
      />
      <Tabs.Screen name="habits" options={{
        title: 'Habits',
        tabBarIcon: ({ color }) => <TabIcon name="checkmark-circle-outline" color={color} />,
      }} />
      <Tabs.Screen name="journal" options={{
        title: 'Journal',
        tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
      }} />
      <Tabs.Screen name="focus" options={{
        title: 'Focus',
        tabBarIcon: ({ color }) => <TabIcon name="timer-outline" color={color} />,
      }} />
      <Tabs.Screen name="insights" options={{
        title: 'Insights',
        tabBarIcon: ({ color }) => <TabIcon name="analytics-outline" color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
      }} />
    </Tabs>
  );
}
```

**How navigation works in this app:**

The `app/` directory structure maps directly to the app's screen hierarchy:

```
app/
├── _layout.tsx          → Root: auth check, splash screen
├── (auth)/
│   ├── _layout.tsx      → Auth stack layout
│   ├── login.tsx         → /login screen
│   └── signup.tsx        → /signup screen
├── (tabs)/
│   ├── _layout.tsx      → Tab bar (this file)
│   ├── index.tsx         → Today tab
│   ├── habits.tsx        → Habits tab
│   ├── journal.tsx       → Journal tab
│   ├── focus.tsx         → Focus tab
│   ├── insights.tsx      → Insights tab
│   └── profile.tsx       → Profile tab
├── protocols.tsx         → Modal screen (science protocols)
├── ai-insights.tsx       → Modal screen (AI analysis)
└── privacy-policy/       → Modal screen (legal text)
```

Each `_layout.tsx` defines how its child screens are arranged. The root layout uses a `Stack` (screens slide in from the right). Inside `(tabs)`, the layout uses `Tabs` (a bottom navigation bar).

---

### 4.8 Authentication — Login and Signup

**File: `app/(auth)/login.tsx`**

The login screen demonstrates two authentication methods: email/password and Apple Sign-In.

```typescript
async function handleLogin() {
  if (!email || !password) {
    setError('Please enter email and password');
    return;
  }
  setLoading(true);
  setError('');

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);
  if (authError) {
    setError(authError.message);
  }
}
```

This is straightforward: call Supabase's `signInWithPassword`, and if it fails, show the error message. Notice that on success, we don't need to manually navigate — the `onAuthStateChange` listener in `_layout.tsx` detects the new session and redirects automatically.

**Apple Sign-In** is more involved:

```typescript
async function handleAppleSignIn() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (authError) setError(authError.message);
    }
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code !== 'ERR_REQUEST_CANCELED') {
      setError('Apple Sign-In failed');
    }
  }
}
```

The flow: Apple's native dialog gives us an identity token → we pass that token to Supabase → Supabase verifies it with Apple's servers and creates/finds the user account. The `ERR_REQUEST_CANCELED` check ignores the case where the user dismisses the Apple dialog (that's not an error).

The login screen also shows the Apple button only on iOS with `{Platform.OS === 'ios' && (...)}` — Android doesn't have Apple Sign-In.

---

### 4.9 Custom Hooks — Reusable Logic

Hooks are the heart of the app's architecture. They encapsulate data logic so screens stay simple.

#### `useHabits` — The Biggest Hook

**File: `hooks/useHabits.ts`**

This hook provides everything a screen needs to work with habits: fetching, creating, deleting, and toggling completions.

```typescript
export function useHabits() {
  const { session, habits, setHabits, addHabit, removeHabit, updateHabitCompletions, isLoading, setIsLoading } =
    useAppStore();

  const userId = session?.user?.id;

  const fetchHabits = useCallback(async () => {
    if (DEMO_MODE) return;
    if (!userId) return;
    setIsLoading(true);

    try {
      // Step 1: Fetch the user's active habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, user_id, title, description, ...')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (habitsError) throw habitsError;

      // Step 2: Fetch completions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('id, habit_id, user_id, completed_at, note, quality_rating')
        .eq('user_id', userId)
        .gte('completed_at', thirtyDaysAgo.toISOString());

      // Step 3: Group completions by habit
      const completionsByHabit = new Map<string, HabitCompletion[]>();
      for (const c of completionsData ?? []) {
        const existing = completionsByHabit.get(c.habit_id) ?? [];
        existing.push(c);
        completionsByHabit.set(c.habit_id, existing);
      }

      // Step 4: Merge and calculate streaks
      const habitsWithCompletions: HabitWithCompletions[] = habitsData.map((h: Habit) => {
        const completions = completionsByHabit.get(h.id) ?? [];
        return {
          ...h,
          completions,
          currentStreak: calculateStreak(completions),
        };
      });

      setHabits(habitsWithCompletions);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, setHabits, setIsLoading]);
  // ...
}
```

**Key patterns:**

- **`useCallback`** wraps every function. This ensures the function reference stays stable between re-renders, preventing infinite loops in `useEffect` dependencies.
- **Two separate queries** (habits then completions) instead of a JOIN. This is a deliberate choice — Supabase's PostgREST API makes joins more complex, and two simple queries are easier to reason about.
- **`Map<string, HabitCompletion[]>`** — A Map groups completions by `habit_id`. This is O(n) and avoids nested loops.
- **`finally { setIsLoading(false) }`** — Loading state is always cleared, even if an error occurs. Without `finally`, a failed request would leave the spinner spinning forever.

The `toggleHabitCompletion` function is also worth studying:

```typescript
const toggleHabitCompletion = useCallback(async (habitId: string) => {
  // Check if already completed today
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('completed_at', today.toISOString())
    .lt('completed_at', tomorrow.toISOString())
    .limit(1);

  if (existing && existing.length > 0) {
    // Already done today → undo it
    await supabase.from('habit_completions').delete().eq('id', existing[0].id);
  } else {
    // Not done today → mark complete
    await supabase.from('habit_completions').insert({
      habit_id: habitId,
      user_id: userId,
    });
  }

  // Refetch completions and recalculate streak
  // ...
}, [userId, habits, updateHabitCompletions]);
```

This is a "toggle" pattern — tapping the checkbox either adds or removes today's completion. The date range query (`gte` + `lt`) finds completions from midnight today to midnight tomorrow, handling timezone edges correctly.

#### `useStreak` — Derived Calculations

**File: `hooks/useStreak.ts`**

```typescript
export function useStreak(habit: HabitWithCompletions) {
  const currentStreak = habit.currentStreak;

  const longestStreak = useMemo(() => {
    const dates = habit.completions
      .map((c) => {
        const d = new Date(c.completed_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)  // Remove duplicates
      .sort((a, b) => a - b);                     // Sort chronologically

    let longest = 1;
    let current = 1;
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] - dates[i - 1] === oneDay) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    return longest;
  }, [habit.completions]);

  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return habit.completions.some((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= today.getTime() && t < tomorrow.getTime();
    });
  }, [habit.completions]);

  return { currentStreak, longestStreak, completedToday };
}
```

**`useMemo`** is React's way of caching expensive calculations. The longest streak calculation iterates through all completions — we only want to re-run it when `habit.completions` actually changes, not on every render.

#### `useSubscription` — Subscription Logic

**File: `hooks/useSubscription.ts`**

```typescript
export function useSubscription() {
  const profile = useAppStore((state) => state.profile);
  const tier = profile?.subscription_tier ?? 'free';
  const isPro = tier === 'pro' || tier === 'lifetime';

  function canAddHabit(currentCount: number): boolean {
    if (isPro) return true;
    return currentCount < FEATURES.habits_limit;
  }

  return { tier, isPro, canAddHabit };
}
```

Simple but powerful. Any screen can check `isPro` or call `canAddHabit(habits.length)` to decide whether to show content or the paywall. The logic is in one place — if the free limit changes from 3 to 5, you update `FEATURES.habits_limit` and it applies everywhere.

---

### 4.10 UI Components — Building Blocks

#### `HabitCard` — A Practical Component

**File: `components/habits/HabitCard.tsx`**

```typescript
interface HabitCardProps {
  habit: HabitWithCompletions;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return habit.completions.some((c) => {
      const t = new Date(c.completed_at).getTime();
      return t >= today.getTime() && t < tomorrow.getTime();
    });
  }, [habit.completions]);

  const handleLongPress = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.content}
        onLongPress={handleLongPress}
        accessibilityLabel={`${habit.title}, ${completedToday ? 'completed' : 'not completed'}`}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{habit.title}</Text>
          <View style={styles.meta}>
            {habit.category && (
              <View style={[styles.categoryBadge,
                { backgroundColor: (CATEGORY_COLORS[habit.category] ?? Colors.accent) + '20' }
              ]}>
                <Text style={[styles.categoryText,
                  { color: CATEGORY_COLORS[habit.category] ?? Colors.accent }
                ]}>
                  {habit.category}
                </Text>
              </View>
            )}
            {habit.currentStreak > 0 && (
              <Text style={styles.streak}>🔥 {habit.currentStreak}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkbox, completedToday && styles.checkboxCompleted]}
          onPress={onToggle}
          accessibilityLabel={`Toggle ${habit.title}`}
          accessibilityRole="checkbox"
        >
          {completedToday && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );
}
```

**Beginner takeaways:**

- **Props interface** — `HabitCardProps` explicitly declares what this component needs. If you forget to pass `onToggle`, TypeScript catches it.
- **`onLongPress` + Alert.alert** — Long-pressing shows a confirmation dialog. Destructive actions should always have a confirmation step.
- **Accessibility** — Every interactive element has an `accessibilityLabel` and the checkbox has `accessibilityRole="checkbox"`. Screen readers use these to help visually impaired users navigate the app.
- **Dynamic colors** — `(CATEGORY_COLORS[habit.category] ?? Colors.accent) + '20'` appends a hex opacity suffix. `'#22C55E' + '20'` becomes `'#22C55E20'`, which is the same green at ~12% opacity. This creates a subtle background tint.
- **Conditional rendering** — `{habit.category && (...)}` only renders the category badge if the habit has a category. `{habit.currentStreak > 0 && (...)}` only shows the streak if it's positive. This pattern is used throughout React.

---

### 4.11 The Today Dashboard — Bringing It All Together

**File: `app/(tabs)/index.tsx`**

This is the main screen users see. It demonstrates how hooks, components, and state work together:

```typescript
export default function TodayScreen() {
  const { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion, isLoading } =
    useHabits();
  const { canAddHabit } = useSubscription();
  const profile = useAppStore((s) => s.profile);
  const [showForm, setShowForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const stats = useMemo(() => {
    let completedCount = 0;
    let bestStreak = 0;
    for (const habit of habits) {
      const done = habit.completions.some((c) => { /* check today */ });
      if (done) completedCount++;
      if (habit.currentStreak > bestStreak) bestStreak = habit.currentStreak;
    }
    return { completedCount, total: habits.length, bestStreak };
  }, [habits]);
  // ...
}
```

**The screen's lifecycle:**
1. Component mounts → `useEffect` calls `fetchHabits()` → data loads from Supabase → store updates → component re-renders with habits
2. User taps "+" FAB → `canAddHabit` checks the free limit → shows either the habit form or the paywall
3. User taps a habit's checkbox → `toggleHabitCompletion` → updates database → refetches completions → store updates → UI reflects the change

The **FAB (Floating Action Button)** shows the paywall pattern:

```typescript
<TouchableOpacity
  style={styles.fab}
  onPress={() => {
    if (canAddHabit(habits.length)) {
      setShowForm(true);     // Under the limit → show creation form
    } else {
      setShowPaywall(true);  // At the limit → show upgrade modal
    }
  }}
  accessibilityLabel="Add new habit"
>
  <Text style={styles.fabText}>+</Text>
</TouchableOpacity>
```

The **pull-to-refresh** pattern is built into `FlatList`:

```typescript
<FlatList
  data={habits}
  keyExtractor={(item) => item.id}
  renderItem={renderHabit}
  refreshing={isLoading}
  onRefresh={fetchHabits}
  ListEmptyComponent={...}
/>
```

`FlatList` is preferred over `ScrollView` + `.map()` for lists because it only renders items currently visible on screen. With 100 habits, `ScrollView` would render all 100 at once; `FlatList` might render 10.

---

### 4.12 The Focus Timer — A Complete Feature

**File: `app/(tabs)/focus.tsx`**

The focus timer demonstrates more complex state management with `useRef` and interval-based updates:

```typescript
const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '90 min', minutes: 90 },
];

const SESSION_TYPES: { key: SessionType; label: string }[] = [
  { key: 'deep_work', label: 'Deep Work' },
  { key: 'study', label: 'Study' },
  { key: 'creative', label: 'Creative' },
  { key: 'admin', label: 'Admin' },
];
```

The 90-minute preset is based on the ultradian rhythm research — the app's science layer informs even its UI choices.

```typescript
function startTimer() {
  setIsRunning(true);
  setStartedAt(new Date());
  intervalRef.current = setInterval(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}
```

**Why `useRef` for the interval?** `setInterval` returns an ID you need to clear it later. If we stored it in state (`useState`), the component would re-render every time we set it. `useRef` stores the value without triggering re-renders. It's like a box that holds a value but doesn't notify React about changes.

The timer also implements a **Pomodoro break pattern**:

```typescript
const completed = sessionsCompleted + 1;
const breakMinutes = completed % 4 === 0 ? 15 : 5;
setIsBreak(true);
setSecondsLeft(breakMinutes * 60);
```

Every 4th completed session, you get a 15-minute break instead of 5. This follows the classic Pomodoro Technique.

---

### 4.13 The Science Layer

**File: `lib/science.ts`**

This is what makes 1000x different from a generic habit tracker. These functions implement real scientific concepts:

```typescript
/**
 * Measures how clustered habit completions are within 30-minute windows.
 * Habit stacking (doing habits back-to-back) improves adherence.
 * Returns 0-100.
 */
export function calculateHabitStackScore(completions: HabitCompletion[]): number {
  if (completions.length < 2) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  let clustered = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      new Date(sorted[i].completed_at).getTime() -
      new Date(sorted[i - 1].completed_at).getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    if (diff <= thirtyMinutes) {
      clustered++;
    }
  }

  return Math.round((clustered / (sorted.length - 1)) * 100);
}
```

**The science:** "Habit stacking" (from James Clear's *Atomic Habits*) means doing habits in a chain — "After I brush my teeth, I meditate. After I meditate, I journal." This function measures how clustered a user's completions are. If all 3 habits were completed within 30 minutes of each other, the score is 100. If they were spread across the day, it's 0.

The **consistency score** uses recency weighting:

```typescript
export function calculateConsistencyScore(completions: HabitCompletion[], days: number): number {
  for (let d = 0; d < days; d++) {
    // Weight: more recent days count more
    const weight = (days - d) / days;
    totalWeight += weight;
    if (hasCompletion) {
      weightedSum += weight;
    }
  }
  return Math.round((weightedSum / totalWeight) * 100);
}
```

If you track 30 days and completed all of the first 15 but none of the last 15, your score is low — because the recent days matter more. This is based on research showing that recent behavior is a better predictor of future behavior than historical averages.

---

### 4.14 Subscriptions and the Paywall

**File: `lib/revenuecat.ts`**

RevenueCat abstracts the complexity of App Store and Play Store billing:

```typescript
export async function initRevenueCat(userId: string): Promise<void> {
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_RC_KEY_IOS ?? ''
      : process.env.EXPO_PUBLIC_RC_KEY_ANDROID ?? '';

  if (!apiKey) {
    console.warn('RevenueCat API key not set. Subscriptions will not work.');
    return;
  }

  await Purchases.configure({ apiKey });
  await Purchases.logIn(userId);
}
```

Each platform has its own API key because Apple and Google have separate billing systems. The `logIn(userId)` call ties the RevenueCat customer to our Supabase user ID, so subscription status persists across devices.

**File: `components/ui/PaywallModal.tsx`**

The paywall is a modal that appears when free users hit a limit. Key aspects:

- It fetches available packages from RevenueCat (prices come from App Store Connect/Play Console)
- Defaults to selecting the annual plan (best value for the user, best revenue for the developer)
- Includes a "Restore Purchases" button (required by Apple for approval)
- Shows legal text about auto-renewal (also required by Apple)

```typescript
<Text style={styles.legal}>
  Payment will be charged to your App Store account. Subscription
  automatically renews unless cancelled at least 24 hours before the
  end of the current period. Manage subscriptions in Settings.
</Text>
```

Omitting this text will get your app rejected during App Store review.

---

### 4.15 Feature Flags

**File: `lib/features.ts`**

```typescript
export const FEATURES = {
  habits_limit: 3,
  journal: true,
  focus_timer: true,
  basic_streaks: true,
  habits_unlimited: 'pro',
  ai_insights: 'pro',
  performance_analytics: 'pro',
  journal_export: 'pro',
  advanced_charts: 'pro',
  science_protocols: 'pro',
  weekly_report: 'pro',
} as const;

export function canAccess(feature: string, tier: 'free' | 'pro' | 'lifetime'): boolean {
  const value = FEATURES[feature as keyof typeof FEATURES];
  if (typeof value === 'boolean') return value;       // Free features
  if (typeof value === 'number') return true;          // Numeric limits (handled elsewhere)
  if (value === 'pro') return tier === 'pro' || tier === 'lifetime';
  return false;
}
```

**`as const`** is a TypeScript trick that makes the object deeply readonly. Without it, `FEATURES.habits_limit` would be typed as `number`; with it, it's typed as the literal `3`. This provides better type safety and autocompletion.

This is a simple but effective feature flag system. As the app grows, you could replace this with a remote config service (LaunchDarkly, Firebase Remote Config) to change flags without shipping app updates.

---

### 4.16 Styling and Theming

**File: `constants/Colors.ts`**

```typescript
export const Colors = {
  background: '#0A0A0F',
  card: '#14141F',
  accent: '#7C5CFC',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#1E1E2E',
  inputBg: '#1A1A2E',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  focus: '#7C5CFC',
  sleep: '#6366F1',
  exercise: '#22C55E',
  nutrition: '#F59E0B',
  mindfulness: '#EC4899',
};
```

The entire app uses a dark theme. All colors are defined in one file, so changing the accent from purple to blue is a single-line change. The color values follow Tailwind CSS conventions (the success green is Tailwind's `green-500`, the warning amber is `amber-500`).

Components reference these constants instead of hardcoded values:

```typescript
// ✅ Good — uses the theme
backgroundColor: Colors.background

// ❌ Bad — hardcoded, will break if the theme changes
backgroundColor: '#0A0A0F'
```

---

## 5. Suggestions for Improvement

After reviewing the entire codebase, here are five concrete improvements that would make the app more robust, performant, and maintainable:

### 1. Add Optimistic Updates to Habit Toggling

**Current behavior:** When a user taps a habit checkbox, the app sends a request to Supabase and waits for it to complete before updating the UI. On a slow connection, the checkbox feels laggy.

**Improvement:** Update the UI immediately (optimistically), then sync with the server in the background. If the server request fails, roll back the UI change.

```typescript
// Current: waits for the server
const toggleHabitCompletion = useCallback(async (habitId: string) => {
  // ...database operations...
  // UI only updates after the await completes
});

// Improved: update UI first, sync later
const toggleHabitCompletion = useCallback(async (habitId: string) => {
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  // Step 1: Immediately update local state
  const isCompleted = checkCompletedToday(habit);
  const optimisticCompletions = isCompleted
    ? habit.completions.filter((c) => !isToday(c.completed_at))
    : [...habit.completions, createTempCompletion(habitId, userId)];
  updateHabitCompletions(habitId, optimisticCompletions, calculateStreak(optimisticCompletions));

  // Step 2: Sync with server in the background
  try {
    if (isCompleted) {
      await supabase.from('habit_completions').delete()...;
    } else {
      await supabase.from('habit_completions').insert({...});
    }
  } catch (err) {
    // Step 3: Roll back on failure
    updateHabitCompletions(habitId, habit.completions, habit.currentStreak);
    Alert.alert('Error', 'Failed to save. Please try again.');
  }
});
```

This makes the app feel instant regardless of network speed.

### 2. Extract Duplicated "Completed Today" Logic into a Utility

The same date-range check for "is this habit completed today?" appears in at least four places: `HabitCard.tsx`, `useStreak.ts`, `useHabits.ts`, and `app/(tabs)/index.tsx`. Each reimplements it slightly differently.

**Improvement:** Create a single utility function:

```typescript
// lib/date-utils.ts
export function isCompletedToday(completions: HabitCompletion[]): boolean {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 86_400_000; // 24 hours in ms
  return completions.some((c) => {
    const t = new Date(c.completed_at).getTime();
    return t >= startOfDay && t < endOfDay;
  });
}
```

Then replace all four implementations with `isCompletedToday(habit.completions)`. If the date logic ever needs to change (e.g., to respect the user's timezone), you fix it in one place.

### 3. Add Error Boundaries and User-Facing Error States

Currently, most errors are logged to `console.error` but never shown to the user. If the habit fetch fails, the screen just shows "No habits yet" — the user has no idea something went wrong.

**Improvement:** Add an error state to the store and display it:

```typescript
// In useAppStore.ts, add:
error: null as string | null,
setError: (error: string | null) => set({ error }),

// In hooks, surface errors:
catch (err) {
  console.error('Error fetching habits:', err);
  setError('Failed to load habits. Pull down to retry.');
}

// In screens, show the error:
{error && (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={() => { setError(null); fetchHabits(); }}>
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

Additionally, wrap the root layout in a React Error Boundary to catch unexpected crashes and show a "something went wrong" screen instead of a white screen of death.

### 4. Add Unit Tests for the Science Layer

The functions in `lib/science.ts` are pure functions (no side effects, same input always produces same output). They are ideal candidates for unit tests, and they contain critical business logic that should not break silently.

**Improvement:** Add a test file using Jest (Expo includes it by default):

```typescript
// __tests__/science.test.ts
import { calculateStreak, calculateConsistencyScore, calculateHabitStackScore } from '@/lib/science';

describe('calculateStreak', () => {
  it('returns 0 for no completions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('counts consecutive days from today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const completions = [
      { id: '1', habit_id: 'h1', user_id: 'u1', completed_at: today.toISOString(), note: null, quality_rating: null },
      { id: '2', habit_id: 'h1', user_id: 'u1', completed_at: yesterday.toISOString(), note: null, quality_rating: null },
    ];
    expect(calculateStreak(completions)).toBe(2);
  });

  it('breaks streak on a missed day', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const completions = [
      { id: '1', habit_id: 'h1', user_id: 'u1', completed_at: today.toISOString(), note: null, quality_rating: null },
      { id: '2', habit_id: 'h1', user_id: 'u1', completed_at: threeDaysAgo.toISOString(), note: null, quality_rating: null },
    ];
    expect(calculateStreak(completions)).toBe(1); // Gap breaks it
  });
});
```

This is especially important for `calculateStreak`, which has a subtle edge case: if today hasn't been completed yet, it skips today and starts counting from yesterday. A test makes sure that behavior stays correct as the code evolves.

### 5. Replace the DEMO_MODE Flag with a Context Provider

`DEMO_MODE` is checked in 4+ files by re-evaluating `process.env.EXPO_PUBLIC_SUPABASE_URL`. Each file independently decides whether to use real or mock data. This pattern makes it hard to switch modes at runtime and leads to scattered conditional logic.

**Improvement:** Create a React context that provides a data source:

```typescript
// lib/data-provider.tsx
import { createContext, useContext } from 'react';

interface DataProvider {
  isDemoMode: boolean;
  fetchHabits: (userId: string) => Promise<HabitWithCompletions[]>;
  createHabit: (userId: string, data: CreateHabitInput) => Promise<HabitWithCompletions>;
  toggleCompletion: (habitId: string, userId: string) => Promise<HabitCompletion[]>;
  // ...other operations
}

const DataContext = createContext<DataProvider>(null!);

export function useData() {
  return useContext(DataContext);
}

// Two implementations:
export const SupabaseProvider: DataProvider = { isDemoMode: false, /* real implementations */ };
export const MockProvider: DataProvider = { isDemoMode: true, /* mock implementations */ };

// In _layout.tsx:
<DataContext.Provider value={DEMO_MODE ? MockProvider : SupabaseProvider}>
  <Stack>...</Stack>
</DataContext.Provider>
```

This eliminates every `if (DEMO_MODE)` check from hooks and centralizes the data layer. It also makes testing easier — you can inject a test provider that returns controlled data.

---

**Congratulations!** You've just walked through the entire architecture of a production mobile app. The patterns you've seen here — hooks for logic, stores for state, types for safety, RLS for security — are the same patterns used by apps serving millions of users. Start the dev server with `npm start`, experiment with the code, and build something amazing.
