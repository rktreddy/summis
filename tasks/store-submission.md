# Summis — App Store Submission Checklist

**Goal:** Ship Summis to App Store and Google Play
**Status:** Code review complete, P0–P3 fixes applied, needs configuration + account setup
**Estimated effort:** 3–5 days (mostly non-code work)

---

## Phase 1: Foundation (Day 1)

### EAS & Expo Setup
- [ ] Create Expo account at https://expo.dev if not already done
- [ ] Run `eas init` in the project root to generate a real project ID
- [ ] Update `app.json` — replace `"your-eas-project-id"` with the real ID
- [ ] Update the EAS updates URL with `https://u.expo.dev/<real-id>`
- [ ] Verify: `eas whoami` shows your account

### RevenueCat Setup
- [ ] Create RevenueCat account at https://www.revenuecat.com
- [ ] Create a new project in RevenueCat dashboard
- [ ] Create iOS app in RevenueCat → copy the public API key
- [ ] Create Android app in RevenueCat → copy the public API key
- [ ] Add to `.env.local`:
  ```
  EXPO_PUBLIC_RC_KEY_IOS=<your-ios-key>
  EXPO_PUBLIC_RC_KEY_ANDROID=<your-android-key>
  ```
- [ ] Configure products in RevenueCat matching these IDs:
  - `com.summis.pro.monthly` — $7.99/mo
  - `com.summis.pro.annual` — $49.99/yr
  - `com.summis.lifetime` — $79.99 one-time
- [ ] Create entitlement `pro_access` and attach all 3 products to it

### Production Supabase
- [ ] Option A: Create a new Supabase project for production (clean slate)
- [ ] Option B: Reuse existing thousandx project (legacy tables just sit unused)
- [ ] Copy the project URL and anon key
- [ ] Run migrations against production: `supabase db push --db-url <production-db-url>`
- [ ] Verify all 16 migrations applied (001–016, check Tables tab in Supabase dashboard)
- [ ] Set Edge Function secrets in Supabase dashboard (Project Settings → Edge Functions):
  - `ANTHROPIC_API_KEY` — for AI insights (Claude API)
  - `CRON_SECRET` — shared secret for cron job authentication
  - `SUPABASE_ANON_KEY` — needed by edge functions for user-scoped clients
- [ ] Deploy Edge Functions: `supabase functions deploy --project-ref <prod-ref>`
- [ ] Run cron.sql in SQL Editor (replace `<YOUR_CRON_SECRET>` with real secret)
- [ ] Test: call `/functions/v1/performance-score` with a valid JWT to verify it works
- [ ] Add production env vars to `eas.json` under the `production` profile:
  ```json
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "<prod-url>",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "<prod-anon-key>"
  }
  ```

---

## Phase 2: Apple Developer Setup (Day 1–2)

### Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year) at https://developer.apple.com
- [ ] Wait for approval (can take 24–48 hours)
- [ ] Note your **Team ID** (Account → Membership → Team ID)

### App Store Connect
- [ ] Create a new app in App Store Connect (https://appstoreconnect.apple.com)
  - Bundle ID: `com.summis.app`
  - Name: `Summis`
  - Primary language: English
  - Category: Health & Fitness (or Productivity)
- [ ] Note the **App Store Connect App ID** (numeric, shown in the URL or General → App Information)
- [ ] Update `eas.json` submission config:
  ```json
  "submit": {
    "production": {
      "ios": {
        "appleId": "<your-apple-id-email>",
        "ascAppId": "<app-store-connect-app-id>",
        "appleTeamId": "<your-team-id>"
      }
    }
  }
  ```

### In-App Purchases (Apple)
- [ ] In App Store Connect → In-App Purchases, create 3 subscriptions:
  - `com.summis.pro.monthly` — Auto-renewable, $7.99
  - `com.summis.pro.annual` — Auto-renewable, $49.99
  - `com.summis.lifetime` — Non-consumable, $79.99
- [ ] Create a subscription group called "Summis Pro"
- [ ] Add the monthly and annual subscriptions to the group
- [ ] Connect App Store Connect to RevenueCat (shared secret)
- [ ] Verify products appear in RevenueCat dashboard

---

## Phase 3: Google Play Setup (Day 1–2, parallel with Phase 2)

### Google Play Developer Account
- [ ] Register at https://play.google.com/console ($25 one-time fee)
- [ ] Create a new app:
  - App name: `Summis`
  - Default language: English
  - App type: App
  - Category: Health & Fitness

### Google Play Billing
- [ ] In Google Play Console → Monetize → Products → Subscriptions, create:
  - `com.summis.pro.monthly` — $7.99/mo
  - `com.summis.pro.annual` — $49.99/yr
- [ ] In Products → In-app products, create:
  - `com.summis.lifetime` — $79.99
- [ ] Connect Google Play to RevenueCat (service account credentials)

### Google Service Account (for EAS Submit)
- [ ] In Google Cloud Console, create a service account with Play Console access
- [ ] Download the JSON key file
- [ ] Save as `google-service-account.json` in project root
- [ ] Add `google-service-account.json` to `.gitignore` (IMPORTANT — do not commit this)
- [ ] Verify `eas.json` points to it: `"serviceAccountKeyPath": "./google-service-account.json"`

---

## Phase 4: Store Listing Content (Day 2–3)

### App Icon & Splash Screen
- [ ] Create Summis app icon (1024×1024) — replace `assets/images/icon.png`
- [ ] Create Summis splash screen — replace `assets/images/splash-icon.png`
- [ ] Create adaptive icon for Android — replace `assets/images/adaptive-icon.png`

### Privacy Policy
- [ ] Host the privacy policy at a public HTTPS URL
  - Option A: Deploy to a simple static site (Vercel, Netlify, GitHub Pages)
  - Option B: Host at `https://summis.app/privacy`
- [ ] Enter the URL in both App Store Connect and Google Play Console
- [ ] Ensure the policy mentions:
  - Account deletion (now implemented via delete-account edge function)
  - Data collected: sprint data, MITs, hygiene compliance, focus quality ratings
  - Third-party services: Supabase, RevenueCat, Anthropic (AI insights)

### App Store Screenshots (iOS)
- [ ] Take screenshots on iPhone 15 Pro Max (6.7") — at least 3, ideally 6–8:
  1. Today tab: MITs + hygiene score + greeting
  2. Sprint timer in action (minimal, focused UI)
  3. Sprint intention screen with energy phase coaching
  4. Score tab: performance chart + weekly summary
  5. Correlation insight card: "Focus 23% higher on phone-away days"
  6. Cognitive Hygiene Setup (onboarding)
- [ ] Take screenshots on iPhone SE (4.7") if supporting smaller devices

### Google Play Screenshots (Android)
- [ ] Same screens as iOS, taken on a Pixel-class device
- [ ] Min 320px, max 3840px on any side — at least 2, ideally 6–8

### Marketing Copy
- [ ] Write App Store description (max 4000 chars)
  - Lead with: "Summis coaches you through science-backed focus practices and proves which ones actually work — with your own data."
  - Key features: focus sprints (Yousef protocol), cognitive hygiene tracking, correlation engine, MITs
  - Use "based on peer-reviewed research" — never "proven to"
  - Avoid "biohacker" language — use "cognitive hygiene", "evidence-based", "systems"
  - Mention: Ward et al. (2017) Brain Drain study, Dr. Sahar Yousef's framework
- [ ] Write short description (max 80 chars for Google Play):
  "Science-backed focus sprints. Prove what works with your own data."
- [ ] Write subtitle (max 30 chars for iOS):
  "Your focus, measured."
- [ ] Prepare keywords (iOS, comma-separated, max 100 chars):
  "focus,sprint,productivity,cognitive,performance,deep work,concentration,timer"

### App Review Notes
- [ ] Prepare demo account credentials for Apple reviewers:
  ```
  Email: reviewer@summis.app
  Password: <create-a-test-account>
  ```
- [ ] Write review notes explaining:
  - How to test: create account → complete cognitive hygiene setup → set MITs → run a sprint
  - The app coaches users to put their phone away during sprints (low DAU by design)
  - AI insights (Claude API) is a Pro-only feature
  - Subscription tiers: Free (3 sprints/day), Pro ($7.99/mo), Annual ($49.99/yr), Lifetime ($79.99)
  - Account deletion available (GDPR compliant)

---

## Phase 5: Build & Test (Day 3–4)

### Development Build
- [ ] Run `npm run build:dev` — verify it completes without errors
- [ ] Install dev build on a physical iPhone via Expo
- [ ] Install dev build on a physical Android device

### Preview Build (Internal Testing)
- [ ] Run `npm run build:preview`
- [ ] Distribute to 2–3 testers via EAS internal distribution
- [ ] Testers complete this smoke test checklist:
  - [ ] Sign up with email
  - [ ] Complete cognitive hygiene onboarding (chronotype, notifications, phone placement, sprint schedule)
  - [ ] Set 3 MITs for today
  - [ ] Run a focus sprint (30 min preset for testing)
  - [ ] Complete rest phase
  - [ ] Complete reflection (rate focus quality, intention met)
  - [ ] Check score tab shows data
  - [ ] Verify hygiene score ring updates on Today tab
  - [ ] View correlation insights (should show paywall for free user, or "building data" for Pro)
  - [ ] Attempt 4th sprint (should show upgrade prompt for free user)
  - [ ] Check offline banner appears when network is killed
  - [ ] Restore network — verify queued changes sync
  - [ ] Test account deletion flow

### Production Build
- [ ] Run final checks:
  ```bash
  npm test          # all 206 tests pass
  npm run typecheck # zero TypeScript errors
  ```
- [ ] `npm run build:ios` — production iOS build
- [ ] `npm run build:android` — production Android build
- [ ] Verify build artifacts in EAS dashboard

---

## Phase 6: Submit (Day 4–5)

### iOS Submission
- [ ] `npm run submit:ios` — uploads to App Store Connect
- [ ] In App Store Connect:
  - [ ] Add screenshots to all required device sizes
  - [ ] Fill in description, subtitle, keywords
  - [ ] Set age rating (4+)
  - [ ] Add privacy policy URL
  - [ ] Add demo account in App Review Information
  - [ ] Select pricing (Free with In-App Purchases)
  - [ ] Submit for review
- [ ] Wait for review (typically 24–48 hours)
- [ ] If rejected: read the rejection reason, fix, resubmit

### Android Submission
- [ ] `npm run submit:android` — uploads to Google Play Console
- [ ] In Google Play Console:
  - [ ] Complete store listing (description, screenshots)
  - [ ] Complete content rating questionnaire
  - [ ] Set up pricing and distribution
  - [ ] Add privacy policy URL
  - [ ] Create an internal testing track first (recommended)
  - [ ] Promote to production after internal testing
- [ ] Wait for review (typically 1–7 days for first submission)

---

## Phase 7: Post-Launch (Week 2+)

### Monitoring
- [ ] Activate Sentry: set `EXPO_PUBLIC_SENTRY_DSN` in production env
- [ ] Activate Mixpanel: set `EXPO_PUBLIC_MIXPANEL_TOKEN` in production env
- [ ] Monitor RevenueCat dashboard for subscription metrics
- [ ] Monitor Supabase dashboard for database performance
- [ ] Monitor edge function invocations for rate limiting / errors

### Optional Activations
- [ ] OneSignal push notifications (replace Expo Notifications for richer targeting)
- [ ] HealthKit / Google Fit integration (uncomment in `lib/health-kit.ts`)
- [ ] Home screen widgets (requires native code — `expo-widgets`)

### Iteration
- [ ] Review Sentry errors weekly — fix top crashers
- [ ] Review user feedback in app store reviews
- [ ] Plan next feature sprint based on analytics data
- [ ] After 30 days: verify correlation engine produces meaningful insights for early users

---

## Quick Reference: Key Commands

```bash
# Build
eas init                              # Generate project ID (one-time)
npm run build:dev                     # Development build
npm run build:preview                 # Internal testing build
npm run build:ios                     # Production iOS
npm run build:android                 # Production Android

# Submit
npm run submit:ios                    # Upload to App Store Connect
npm run submit:android                # Upload to Google Play

# Supabase
supabase db push --db-url <url>       # Push migrations to production
supabase functions deploy             # Deploy edge functions

# Verify
npm test                              # Run test suite (206 tests)
npm run typecheck                     # TypeScript validation
```

---

## Code Review Fixes Applied (Pre-Submission)

All P0–P3 issues from the comprehensive code review have been addressed:

- **Security:** Edge functions use user JWT (not service role key), CORS headers, rate limiting, cron secret validation, generic error messages
- **Data integrity:** hygieneLogs persisted, sprint/MIT creation syncs to Supabase, optimistic updates with rollback
- **Logic:** Score formula matches CLAUDE.md weights, feature flags work correctly, profile fields read from DB
- **Compliance:** Account deletion endpoint (GDPR), password strength (8+ chars, letters + numbers), legal text 12px minimum
- **DB:** Text length constraints on all user-input columns, enum constraints for chronotype + phone placement
- **Tests:** 206 tests across 17 suites (sprint-protocol, hygiene-engine, subscription-limits, correlation-engine, chronotype, science, date-utils, etc.)
- **Accessibility:** Radio groups, checkbox states, progress bars, descriptive labels across 9 components
- **Design system:** Spacing.ts + Typography.ts constants created

---

*Last updated: 2026-03-28*
