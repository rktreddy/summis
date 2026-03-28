# 1000x — App Store Submission Checklist

**Goal:** Ship 1000x to App Store and Google Play
**Status:** Feature-complete, needs configuration + account setup
**Estimated effort:** 3–5 days (mostly non-code work)

---

## Phase 1: Foundation (Day 1)

### EAS & Expo Setup
- [ ] Create Expo account at https://expo.dev if not already done
- [ ] Run `eas init` in the project root to generate a real project ID
- [ ] Update `app.json` line 70 — replace `"your-eas-project-id"` with the real ID
- [ ] Update `app.json` line 79 — replace the updates URL with `https://u.expo.dev/<real-id>`
- [ ] Update `eas.json` line 78 — replace the updates URL there too
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
  - `com.1000x.pro.monthly` — $7.99/mo
  - `com.1000x.pro.annual` — $49.99/yr
  - `com.1000x.lifetime` — $79.99 one-time
- [ ] Create entitlement `pro_access` and attach all 3 products to it

### Production Supabase
- [ ] Create a new Supabase project for production (separate from dev/staging)
- [ ] Copy the project URL and anon key
- [ ] Run migrations against production: `supabase db push --db-url <production-db-url>`
- [ ] Verify all 14 migrations applied (check Tables tab in Supabase dashboard)
- [ ] Set Edge Function secrets in Supabase dashboard (Project Settings → Edge Functions):
  - `ANTHROPIC_API_KEY` — for AI insights (Claude API)
- [ ] Deploy Edge Functions: `supabase functions deploy --project-ref <prod-ref>`
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
  - Bundle ID: `com.thousandx.app`
  - Name: `1000x`
  - Primary language: English
  - Category: Health & Fitness
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
  - `com.1000x.pro.monthly` — Auto-renewable, $7.99
  - `com.1000x.pro.annual` — Auto-renewable, $49.99
  - `com.1000x.lifetime` — Non-consumable, $79.99
- [ ] Create a subscription group called "1000x Pro"
- [ ] Add the monthly and annual subscriptions to the group
- [ ] Connect App Store Connect to RevenueCat (shared secret)
- [ ] Verify products appear in RevenueCat dashboard

---

## Phase 3: Google Play Setup (Day 1–2, parallel with Phase 2)

### Google Play Developer Account
- [ ] Register at https://play.google.com/console ($25 one-time fee)
- [ ] Create a new app:
  - App name: `1000x`
  - Default language: English
  - App type: App
  - Category: Health & Fitness

### Google Play Billing
- [ ] In Google Play Console → Monetize → Products → Subscriptions, create:
  - `com.1000x.pro.monthly` — $7.99/mo
  - `com.1000x.pro.annual` — $49.99/yr
- [ ] In Products → In-app products, create:
  - `com.1000x.lifetime` — $79.99
- [ ] Connect Google Play to RevenueCat (service account credentials)

### Google Service Account (for EAS Submit)
- [ ] In Google Cloud Console, create a service account with Play Console access
- [ ] Download the JSON key file
- [ ] Save as `google-service-account.json` in project root
- [ ] Add `google-service-account.json` to `.gitignore` (IMPORTANT — do not commit this)
- [ ] Verify `eas.json` points to it: `"serviceAccountKeyPath": "./google-service-account.json"`

---

## Phase 4: Store Listing Content (Day 2–3)

### Privacy Policy
- [ ] Host the privacy policy at a public HTTPS URL
  - Option A: Deploy to a simple static site (Vercel, Netlify, GitHub Pages)
  - Option B: Use Notion page with public sharing enabled
  - Option C: Create a simple landing page at `https://1000x.app/privacy`
- [ ] Enter the URL in both App Store Connect and Google Play Console

### App Store Screenshots (iOS)
- [ ] Take screenshots on iPhone 15 Pro Max (6.7") — required sizes:
  - [ ] 1290 × 2796 px — at least 3, ideally 6–8
- [ ] Take screenshots on iPhone SE (4.7") — if supporting smaller devices:
  - [ ] 750 × 1334 px
- [ ] Recommended screens to capture:
  1. Today dashboard with stats
  2. Habit list with streak rings
  3. Focus timer in action
  4. Journal entry with mood/energy
  5. Performance insights chart
  6. Science protocols screen

### Google Play Screenshots (Android)
- [ ] Take screenshots on Pixel-class device:
  - [ ] Min 320px, max 3840px on any side — at least 2, ideally 6–8
- [ ] Same screens as iOS

### Marketing Copy
- [ ] Write App Store description (max 4000 chars)
  - Lead with value proposition: science-backed productivity system
  - Mention key features: habits, focus timer, journal, AI insights
  - Use "based on peer-reviewed research" — never "proven to"
  - Avoid "biohacker" language — use "systems" and "compounding"
- [ ] Write short description (max 80 chars for Google Play)
- [ ] Write subtitle (max 30 chars for iOS)
- [ ] Prepare keywords (iOS, comma-separated, max 100 chars)

### App Review Notes
- [ ] Prepare demo account credentials for Apple reviewers:
  ```
  Email: reviewer@1000x.app
  Password: <create-a-test-account>
  ```
- [ ] Write review notes explaining:
  - How to test the app (create account, add habits, use timer)
  - Why HealthKit permission is requested (correlate habits with performance)
  - That the app uses AI (Claude API) for personalized insights
  - Subscription tiers and what's gated

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
  - [ ] Complete onboarding goal quiz
  - [ ] Create a habit
  - [ ] Complete a habit (streak increments)
  - [ ] Create a journal entry
  - [ ] Run a focus session (25 min preset)
  - [ ] View insights tab (should show paywall for free user)
  - [ ] Attempt to add a 6th habit (should show upgrade prompt)
  - [ ] Check offline banner appears when network is killed
  - [ ] Restore network — verify queued changes sync

### Production Build
- [ ] Run final checks:
  ```bash
  npm test          # all 142+ tests pass
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
  - [ ] Set content rating (4+)
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

### Optional Activations
- [ ] OneSignal push notifications (replace Expo Notifications for richer targeting)
- [ ] HealthKit / Google Fit integration (uncomment in `lib/health-kit.ts`)
- [ ] Home screen widgets (requires native code — `expo-widgets`)

### Iteration
- [ ] Review Sentry errors weekly — fix top crashers
- [ ] Review user feedback in app store reviews
- [ ] Plan next feature sprint based on analytics data

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
npm test                              # Run test suite
npm run typecheck                     # TypeScript validation
```

---

*Last updated: 2026-03-28*
