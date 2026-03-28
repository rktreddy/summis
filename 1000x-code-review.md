# 1000x Codebase Review — Deployment Readiness Assessment

**Date:** March 27, 2026
**Scope:** Full-stack review — frontend, backend, architecture, testing, and deployment readiness
**Verdict:** Not yet production-ready. Strong foundation, but several critical and high-priority gaps must be addressed before App Store / Play Store submission.

---

## Executive Summary

The 1000x codebase is impressively architected for a project at this stage. The DataProvider abstraction, science layer with citations, correlation engine, and optimistic update patterns show real engineering maturity. However, the app has significant gaps in security, testing, error handling, and production infrastructure that would cause problems in a live environment. This review identifies 8 critical issues, 12 high-priority improvements, and several frontend alternatives worth considering.

---

## 1. Critical Issues (Must Fix Before Deploy)

### 1.1 Supabase Credentials Committed to Source Control

The `.env.local` file contains a live Supabase URL and anon key checked into the repo. While the anon key is designed to be public-facing, having it in version control alongside `CLAUDE.md` (which documents your full schema and RLS policies) gives attackers a detailed blueprint. The anon key itself isn't the crisis — the combination of the key plus your full schema, RLS policy details, and Edge Function logic in a public-readable file is.

**Fix:** Add `.env.local` to `.gitignore` immediately. Rotate the Supabase anon key. Keep only `.env.local.example` with placeholder values in the repo.

### 1.2 No Input Validation or Sanitization on the Backend

The Supabase schema relies entirely on RLS for security, but there are no `CHECK` constraints beyond the `difficulty` column, no input length limits, no content sanitization. A malicious user could insert a 10MB string as a habit title, inject script tags into journal entries (relevant for any future web dashboard or export), or create thousands of habits by calling the API directly (the 5-habit limit is only enforced client-side in `useSubscription`).

**Fix:** Add `CHECK` constraints on text columns (e.g., `CHECK (char_length(title) <= 200)`). Add a server-side habit count check — either via a Postgres trigger or an RPC function that validates before insert. Consider a rate-limiting Edge Function or Supabase's built-in rate limiting.

### 1.3 Feature Gating is Client-Side Only

The free tier's 5-habit limit is enforced in `useSubscription.canAddHabit()`, a React hook. Anyone with the Supabase URL and anon key can call the insert API directly and bypass this entirely. The same applies to Pro-only features — there's no server-side entitlement check.

**Fix:** Add a Postgres function or trigger that checks the user's `subscription_tier` before allowing habit inserts beyond the free limit. For Edge Functions (AI insights, weekly report), verify the user's tier server-side before processing.

### 1.4 EAS Project ID is a Placeholder

`app.json` contains `"projectId": "your-eas-project-id"` and the updates URL points to the same placeholder. This means EAS Build, OTA updates, and submission commands will all fail.

**Fix:** Run `eas init` to generate a real project ID and update both `app.json` and `eas.json`.

### 1.5 No Deep Link / URL Scheme Validation

The app defines `scheme: "thousandx"` but there's no handling for malformed deep links. On Android especially, a crafted `thousandx://` URL could potentially navigate to unexpected routes.

**Fix:** Add deep link validation in the root layout. Expo Router handles most of this, but you should add a whitelist of valid routes and reject anything unexpected.

### 1.6 Apple Sign-In Missing Server-Side Token Verification

The login flow calls `AppleAuthentication.signInAsync()` and passes the identity token to Supabase, but there's no evidence of server-side token verification. Apple requires that you verify the identity token on your server.

**Fix:** Use Supabase's built-in Apple OAuth provider (which handles verification) rather than manual token passing, or add verification in an Edge Function.

### 1.7 No Offline Data Persistence

The app uses Zustand for state management but doesn't persist any data locally. If a user loses connectivity mid-session, all unsaved state is lost. The optimistic updates in `useHabits` will roll back on network failure, which means a user could complete a habit, see it check off, then watch it uncheck when the network request fails.

**Fix:** Add `zustand/middleware` persist with `expo-secure-store` or MMKV as the storage layer. Queue failed operations for retry when connectivity returns.

### 1.8 The `ai-insights` Edge Function Leaks User Data to Claude API

The AI insights function sends habit titles, journal entries (including mood and free-text content), and focus session data to the Anthropic API. The privacy policy mentions Anthropic as a third party, but the data sent is more detailed than users likely expect. Journal entries in particular can contain deeply personal content.

**Fix:** Anonymize journal content before sending — send mood/energy scores and tags only, not raw text. Or give users an explicit opt-in toggle for AI analysis of journal content, separate from the general Pro subscription.

---

## 2. High-Priority Improvements

### 2.1 Testing Coverage is Insufficient for Production

37 tests covering science utilities, date helpers, and the correlation engine is a good start, but there are zero tests for: any React component, any hook, any screen, the DataProvider (mock or Supabase), the Zustand store, Edge Functions, or navigation flows. The science layer is the most-tested part of the app, but it's also the least likely to cause production incidents. The untested areas — data fetching, state management, auth flows — are where bugs actually live.

**Recommendation:** Prioritize integration tests for the auth flow (login → onboarding → dashboard), the habit CRUD cycle (create → complete → verify streak), and the subscription gating logic. Use React Native Testing Library for component tests. Add at least smoke tests for each Edge Function.

### 2.2 Error Handling is Inconsistent

The `ErrorBoundary` catches render crashes and `ErrorBanner` displays runtime errors, which is good. But many async operations have empty or generic catch blocks. For example, `toggleHabitCompletion` rolls back on error but shows a generic "Failed to update" message. Focus session saves can fail silently. Journal entry creation has no retry mechanism.

**Recommendation:** Standardize error handling with an error classification system (network, auth, validation, server). Show specific actionable messages. Add retry with exponential backoff for network errors. Log all errors to Sentry (currently scaffolded but not active).

### 2.3 Performance Concerns at Scale

Several patterns will degrade as users accumulate data over months. `useHabits` fetches all habits with all completions on every mount — for a user with 10 habits over 6 months, that's 1,800+ completion records loaded on app open. The correlation engine processes 30 days of daily scores on every render of the insights screen. `computeMultipliers()` compares 7-day vs 30-day windows, fetching all habit completions for the entire period.

**Recommendation:** Paginate completions — fetch only the last 30 days by default, load more on demand. Memoize expensive computations with `useMemo`. Cache correlation results and recompute only when new data arrives. Consider moving the correlation computation to an Edge Function that runs daily.

### 2.4 No Accessibility Testing

Components have `accessibilityLabel` props, which is a good start, but there's no screen reader testing evidence, no `accessibilityHint` usage, no `accessibilityRole` on many interactive elements, and the color contrast ratio for the dark theme hasn't been verified. The gray-on-dark text (`textSecondary: '#8E8E93'` on `background: '#0A0A0F'`) likely fails WCAG AA.

**Recommendation:** Run an accessibility audit using Expo's accessibility tools. Add `accessibilityRole` and `accessibilityHint` to all interactive elements. Verify color contrast ratios meet WCAG AA (4.5:1 for normal text).

### 2.5 No Loading Skeletons or Optimistic UI Feedback

The app shows loading spinners for most data fetches, but the Today dashboard loads all data sequentially — habits, then performance score, then recovery — resulting in a cascade of loading states. There are no skeleton screens or placeholder content.

**Recommendation:** Add skeleton screens for the dashboard, habits list, and journal. Load data in parallel rather than sequentially. Consider using React Suspense boundaries with Expo Router.

### 2.6 RevenueCat Integration Needs Production Hardening

The RevenueCat setup looks correct for development, but there's no receipt validation, no subscription status caching, no handling for billing grace periods, and no webhook integration for server-side subscription events. If a user's subscription lapses mid-session, they'll retain Pro access until the app restarts and `checkProAccess()` runs again.

**Recommendation:** Add a RevenueCat webhook to Supabase Edge Functions that updates the user's `subscription_tier` in the database when subscription status changes. Cache the subscription status locally with a TTL. Check entitlements on app foreground, not just on launch.

### 2.7 The Mock Provider Diverges from Supabase Provider

The mock data provider in `data-provider.tsx` implements the same interface as the Supabase provider, but the behavior differs in subtle ways. For example, the mock provider stores habits in memory and returns them directly, while the Supabase provider fetches with explicit column selection. The mock provider's `toggleCompletion` likely doesn't replicate the exact optimistic update and rollback behavior.

**Recommendation:** Add integration tests that run the same test suite against both providers to verify behavioral parity. Consider using a local Supabase instance (via Docker) for integration testing instead of a mock.

### 2.8 No Crash Reporting in Production

Sentry is scaffolded but not installed. The `ErrorBoundary` catches render crashes but only displays a retry UI — it doesn't report the crash anywhere. In production, you'll have no visibility into what errors users are experiencing.

**Recommendation:** Install and activate `@sentry/react-native` before launch. It's already scaffolded in `lib/error-logging.ts` — you just need to install the package and uncomment the implementation.

### 2.9 Push Notification Permissions Requested Too Early

`registerForPushNotifications()` is called during app initialization. Requesting notification permission on first launch — before the user understands the value — typically results in 40-60% denial rates. Once denied, it's very difficult to get users to re-enable.

**Recommendation:** Delay the permission request until after a user completes their first habit or finishes their first focus session. Show a pre-permission screen explaining what notifications they'll receive and why ("We'll remind you about your ultradian peak windows").

### 2.10 Journal Export is Plain Text Only

The export function produces plain text and CSV, both via the native share sheet. For Pro users paying $7.99/month, this feels underwhelming. There's no PDF export, no date range filtering, and no structured format that preserves mood/energy data visually.

**Recommendation:** Add PDF export with mood/energy charts using the PDF skill. Add date range filtering. Consider a formatted HTML email option.

### 2.11 No Network State Detection

The app doesn't check for network connectivity before making API calls. Users in airplane mode or poor connectivity will see generic errors instead of a helpful "You're offline" message.

**Recommendation:** Use `@react-native-community/netinfo` to detect connectivity state. Show a persistent offline banner. Queue mutations for replay when connectivity returns (ties into the offline persistence point above).

### 2.12 Web Platform is Incomplete

The `app.json` includes web output configuration and there are some web-specific `confirm()` fallbacks, but several features will break on web: `expo-secure-store` (no web support — falls back to localStorage which isn't encrypted), RevenueCat (native-only SDK), Apple Sign-In (native-only), push notifications (different API on web), and HealthKit (native-only).

**Recommendation:** Either fully commit to web by adding platform detection and web-specific implementations (Stripe for web payments, Web Push API, etc.), or explicitly mark web as unsupported and remove the web configuration to avoid confusion.

---

## 3. Architecture Assessment

### What's Working Well

The **DataProvider abstraction** is the strongest architectural decision in the codebase. Swapping between Supabase and mock implementations via a single environment variable is clean, testable, and makes demo mode trivial. This pattern will also make it easy to swap backends in the future if needed.

The **science layer** is genuinely differentiated. Having `lib/science.ts`, `lib/science-protocols.ts`, and `lib/correlation-engine.ts` as separate, well-tested modules with academic citations gives the app credibility that competitors lack. The Pearson correlation implementation with edge case handling (high/low completers) shows real statistical rigor.

The **optimistic update pattern** in `useHabits` is well-implemented — immediate UI response with background sync and rollback on failure. This is the right pattern for a habit-tracking app where responsiveness matters.

The **chronotype system** (`lib/chronotype.ts`) with personalized daily schedules is a killer feature. Computing peak windows, caffeine cutoffs, and wind-down times from wake time plus chronotype is exactly the kind of personalization that justifies a Pro subscription.

### Architectural Concerns

**Zustand store is too flat.** A single store with 11 properties and 7 setters will become unwieldy as features grow. The store mixes concerns: auth state, habit data, UI state (loading, error), and transient state (milestoneHabit) are all in one object.

**Recommendation:** Split into domain-specific stores: `useAuthStore`, `useHabitStore`, `useUIStore`. Zustand supports this well with its slice pattern.

**Hooks do too much.** `useHabits` handles fetching, creating, deleting, toggling, optimistic updates, rollback, and milestone detection. `usePerformanceScore` computes scores, compares weeks, and persists to the database. These are hard to test in isolation and hard to reason about.

**Recommendation:** Extract data-fetching into a thin hook and move business logic into pure functions in `lib/`. For example, `useHabits` should only manage the fetch/mutate cycle, while streak milestone detection lives in `lib/streak-milestones.ts` (which it partially does already).

**No caching layer.** Every screen mount triggers fresh data fetches. The Today dashboard, Habits screen, and Insights screen all independently fetch the same habit data. There's no shared cache, no stale-while-revalidate pattern, and no deduplication of in-flight requests.

**Recommendation:** Consider React Query (TanStack Query) as a caching and synchronization layer. It would replace the manual fetch/loading/error state management in every hook with automatic caching, background refetching, and request deduplication. This is probably the single highest-impact architectural change you could make.

---

## 4. Frontend Alternatives and Feature Improvements

### 4.1 State Management: React Query + Zustand (Recommended)

Replace the current pattern of "fetch in hook → set in Zustand → render" with React Query for server state and Zustand only for client state (UI preferences, current screen state). React Query gives you automatic caching and background refetching, request deduplication (multiple components requesting habits only triggers one fetch), optimistic updates with simpler rollback, offline support with mutation queuing, and loading/error states without manual management. This would eliminate roughly 60% of the boilerplate in your hooks.

### 4.2 Consider Expo's New Architecture Features

Expo SDK 55 supports React Native's New Architecture (Fabric renderer, TurboModules). Enabling it would improve performance for your animated components (ProgressRing, StreakRing) and reduce bridge overhead for your Reanimated animations. It's opt-in via `app.json`: `"newArchEnabled": true`.

### 4.3 Styling: Migrate to NativeWind or Tamagui

NativeWind 4.2 is already installed but unused. The codebase uses `StyleSheet.create()` with inline style objects, which works but produces verbose code. A `HabitCard` component has 15+ style definitions. NativeWind would reduce this significantly and make responsive design easier. Alternatively, Tamagui offers better performance than NativeWind with compile-time optimization and includes a component library.

### 4.4 Navigation: Add Shared Element Transitions

When tapping a habit card to see details, or a journal entry to expand it, the transition is an abrupt screen push. Expo Router supports shared element transitions via `react-native-reanimated` (which you already have installed). Adding these would make the app feel significantly more polished.

### 4.5 Charts: Consider Replacing Victory Native

Victory Native 41.x is heavy and has known performance issues on Android with large datasets. For your use case (7-day heatmaps, bar charts, progress rings), lighter alternatives include `react-native-gifted-charts` (better Android performance, more chart types), `react-native-chart-kit` (simpler API, smaller bundle), or custom SVG charts with `react-native-svg` (which you already have installed — and your PerformanceChart already uses View-based rendering).

### 4.6 Feature: Add Haptic Feedback

Habit completion is the most frequent interaction in the app. Adding haptic feedback (`expo-haptics`) when a user checks off a habit, hits a milestone, or completes a focus session would make the app feel more satisfying. This is a small change with outsized impact on perceived quality.

### 4.7 Feature: Streak Freeze / Rest Days

Users currently break their streak if they miss a single day, which is punishing and can cause the "what-the-hell effect" (missing one day leads to abandoning the habit entirely). Consider adding streak freezes (1 free per week, more for Pro) or rest day scheduling where planned rest days don't break the streak.

### 4.8 Feature: Habit Templates and Import

The onboarding flow pre-loads habits based on goal selection, which is great. Extend this with shareable habit templates — a "Focus Protocol" template that installs 5 habits with triggers, difficulty, and science notes pre-configured. This also creates a viral loop if users can share templates.

### 4.9 Feature: Focus Session Integration with Calendar

The focus timer works in isolation. Integrating with the device calendar to automatically block time during peak windows, or showing upcoming calendar events that conflict with suggested focus blocks, would make the app more actionable.

### 4.10 Feature: Widget Implementation

The home screen widget is listed as "NOT STARTED" in P2. For a habit app, the widget is arguably the most important surface — users check habits from the home screen, not by opening the app. Prioritize this for iOS (using `expo-widgets`) with a simple checkbox list of today's habits.

---

## 5. Deployment Checklist

Before submitting to the App Store and Play Store, these items need attention.

**Must complete:** Replace EAS project ID placeholder, remove credentials from version control, activate Sentry crash reporting, add server-side subscription validation, run accessibility audit and fix contrast issues, add privacy manifest for iOS (required since iOS 17.5), test on physical devices (not just simulators), set up production Supabase environment (separate from development), configure RevenueCat webhooks, and host the privacy policy at a public URL.

**Strongly recommended:** Add React Query for data caching, implement offline persistence, add skeleton loading screens, delay notification permission request, add haptic feedback on key interactions, split Zustand store into domain slices, and add integration tests for auth and habit flows.

**Nice to have for launch:** Shared element transitions, home screen widget, streak freeze feature, calendar integration, and NativeWind migration.

---

## Summary

The 1000x codebase has a strong conceptual foundation — the science layer, chronotype personalization, correlation engine, and DataProvider abstraction are all well-designed. The main gaps are in production hardening: security (server-side validation, credential management), reliability (offline support, error handling, crash reporting), and polish (loading states, accessibility, haptics).

The single highest-impact change would be adopting React Query as a caching layer — it would simplify your hooks, add offline support, eliminate redundant fetches, and reduce the state management complexity across the app. Combined with fixing the critical security issues and activating the already-scaffolded Sentry integration, the app would be in a strong position for a beta launch.

The feature set is genuinely differentiated. No competitor combines science-backed protocols, a correlation engine, chronotype scheduling, and AI insights. The key now is making sure the infrastructure supports the ambition.
