# Summis — App Store Submission Checklist

**Goal:** Ship Summis to App Store and Google Play
**Status:** iOS v1.0.0 build 6 SUBMITTED, **Waiting for Review** as of 2026-04-22 22:41 PT. Android still pending.

---

## Current Submission State (2026-04-22)

**iOS — Waiting for Review**
- App Store Connect App ID: `6762355111`
- Bundle: `com.summis.app`
- Version: 1.0.0, Build 6 (auto-incremented from 5)
- Submission ID: `64e540ee-ccb6-4b4a-8a52-b9ad4df45d0b`
- EAS build URL: https://expo.dev/accounts/rktreddy/projects/summis/builds/22014e8d-4504-485d-92b5-55a4189fb0ab
- Reviewer credentials: `review@summis.app` / `ReviewSummis2026!`
- Demo video attached: `~/Desktop/delete-account-demo.mov`
- Review notes: `tasks/review-notes.txt`

**Previous rejection reasons addressed in this resubmission:**
- **2.1.0 Performance / App Completeness** — launch crash from Sentry native plugin (removed in `6c70cfa`); Apple Sign-In silently failing without nonce (fixed)
- **5.1.1 Privacy / Data Collection** — account deletion flow added (Profile → Delete Account, backed by `delete-account` Edge Function)

**Production database:**
- Supabase project: `hvoiqhjhaolekzsseqni`
- Migrations 001–019 all applied (017, 018, 019 pushed 2026-04-22)
- Migration 019 fixes the chronotype constraint that was blocking onboarding writes
- Edge Functions deployed: `delete-account` (with `--no-verify-jwt` due to new asymmetric JWTs), `ai-insights`, `performance-score`, `weekly-report`
- Secrets set: `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_DB_URL`

---

**Original status:** All 7 redesign phases code-complete (215 tests, 0 TS errors). Needs configuration + account setup.
**Estimated effort:** 2–3 days (mostly non-code work)

---

## Phase 1: Foundation (Day 1)

### EAS & Expo Setup
- [x] Expo account created
- [x] `eas init` run — project ID `6af066f2-7645-4e29-97fa-ff7bd10357ac`
- [x] `app.json` configured with real project ID
- [x] `eas whoami` verified

### RevenueCat Setup
- [x] RevenueCat account + project created
- [x] iOS + Android apps created, keys added to `eas.json`
- [x] Products configured: `com.summis.pro.monthly`, `com.summis.pro.annual`, `com.summis.lifetime`
- [x] Entitlement `pro_access` attached to all 3 products

### Supabase (project: hvoiqhjhaolekzsseqni)
- [x] All 19 migrations applied (017, 018, 019 pushed 2026-04-22)
- [x] Edge Function secrets set (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_DB_URL`)
- [x] Edge Functions deployed: `delete-account` (with `--no-verify-jwt`, see lessons.md), `ai-insights`, `performance-score`, `weekly-report`
- [ ] Verify `cron.sql` applied (pg_cron schedules)
- [x] Supabase URL + anon key in `eas.json` production env

---

## Phase 2: Apple Developer Setup (Day 1–2)

### Apple Developer Account
- [x] Apple Developer Program enrollment active (Team `FC858RSR8A`)

### App Store Connect
- [x] App created (ID `6762355111`, bundle `com.summis.app`)
- [x] `eas.json` submission config populated

### In-App Purchases (Apple)
- [x] 3 IAPs created (`com.summis.pro.monthly`, `com.summis.pro.annual`, `com.summis.lifetime`)
- [x] Subscription group "Summis Pro" set up
- [x] App Store Connect ↔ RevenueCat connected, products verified

---

## Phase 3: Google Play Setup (Day 1–2, parallel with Phase 2)

### Google Play Developer Account
- [x] Google Play Developer account already registered
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
- [x] Summis app icon (1024×1024) — `assets/images/icon.png`
- [x] Summis splash screen — `assets/images/splash-icon.png`
- [x] Adaptive icon for Android — `assets/images/android-icon-*.png`

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
  npm test          # all 215 tests pass
  npm run typecheck # zero TypeScript errors
  ```
- [ ] `npm run build:ios` — production iOS build
- [ ] `npm run build:android` — production Android build
- [ ] Verify build artifacts in EAS dashboard

---

## Phase 6: Submit (Day 4–5)

### iOS Submission (Resubmission Apr 22 2026)
- [x] `npm run build:ios` — build 6 finished
- [x] `npm run submit:ios --id 22014e8d-...` — uploaded to ASC
- [x] In ASC: build 6 selected, screenshots present, description/keywords/subtitle filled, privacy URL set, reviewer credentials updated to `review@summis.app`, video attached, notes pasted from `tasks/review-notes.txt`
- [x] Submitted for review at 2026-04-22 22:41 PT (Submission ID `64e540ee-...`)
- [ ] **Awaiting Apple review decision** — check ASC for status changes, expect email
- [ ] If rejected: address per rejection code, iterate

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
npm test                              # Run test suite (215 tests)
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
- **Tests:** 215 tests across 18 suites (sprint-protocol, hygiene-engine, subscription-limits, correlation-engine, hygiene-correlations, chronotype, science, date-utils, etc.)
- **Accessibility:** Radio groups, checkbox states, progress bars, descriptive labels across 9 components
- **Design system:** Spacing.ts + Typography.ts constants created

---

*Last updated: 2026-04-13*
