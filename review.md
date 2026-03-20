# 1000x — The Science of Productivity & Performance

## Detailed Feature Review & User Guide

---

## What is 1000x?

1000x is a science-backed productivity and performance app for iOS and Android. It combines habit tracking, journaling, focus sessions, and performance analytics — all grounded in peer-reviewed research on ultradian rhythms, the spacing effect, circadian performance peaks, and behavioral psychology. Built for high-performers, biohackers, knowledge workers, and students who want evidence-based tools to optimize their daily routines.

---

## Getting Started

### Creating an Account

1. **Open the app** — you'll land on the login screen with the 1000x branding and "Science-backed performance" tagline.
2. **Sign up** — tap "Don't have an account? Sign Up", enter your email, password (minimum 6 characters), and confirm password.
3. **Apple Sign-In** (iOS only) — alternatively, tap the Apple Sign-In button for a one-tap signup.
4. **Auto-profile** — your profile is created automatically with your email prefix as your display name and your device timezone.

### Onboarding Goal Quiz (New)

After your first login, you'll see a goal quiz: **"What's your #1 performance goal?"**

Pick one of four goals:
- **Sharpen My Focus** — pre-loads Deep Work Block (90 min), No Phone Before 10am, Daily Planning (10 min)
- **Optimize My Sleep** — pre-loads 10:30pm Wind-Down, No Screens 1hr Before Bed, Consistent Wake Time
- **Build Fitness Habits** — pre-loads Morning Movement (20 min), Zone 2 Cardio (30 min), Evening Walk
- **General Well-being** — pre-loads Morning Journal, Hydration (8 glasses), Gratitude Practice

Each preset habit comes with a science note (peer-reviewed citation) and an appropriate difficulty level (Easy, Moderate, or Hard). Tap "Get Started" to create all 3 habits instantly and jump to your Today dashboard.

### Demo Mode

If you just want to explore without creating an account, the app can run in **demo mode** with pre-loaded sample data (3 habits, 4 journal entries, 6 focus sessions). This activates automatically when no backend is configured.

---

## Core Features

### 1. Today Dashboard (Home Tab)

The home screen is your daily command center.

**What you see:**
- A time-based greeting ("Good morning," "Good afternoon," or "Good evening")
- Today's date in full format
- **Stats cards** — "X/Y Completed" showing today's habit progress, and "Best Streak" with your longest consecutive streak
- **Today's Habits** — your active habits listed with checkboxes

**How to use:**
- **Complete a habit** — tap the checkbox next to any habit. The UI updates instantly (optimistic update), then syncs with the server in the background. If sync fails, it rolls back and shows an error banner with a retry option.
- **Create a new habit** — tap the floating **+** button in the bottom-right corner. First pick a **category** (Focus, Sleep, Exercise, Nutrition, Mindfulness, or General). Once selected, 4 category-specific suggestions appear — tap one to auto-fill the title, description, and difficulty, or type your own custom habit below. Set a **difficulty level** (Easy, Moderate, or Hard — defaults to Moderate). Free users can create up to 5 habits; attempting a 6th triggers the upgrade paywall.
- **Streak milestones** — when you complete a habit and hit a streak milestone (7, 14, 30, 60, or 100 days), a celebratory share card appears. Tap "Share" to post your achievement via the native share sheet, or "Dismiss" to close it.
- **Remove a habit** — tap the **x** button on any habit card (or long-press on mobile). A confirmation dialog appears. Removing a habit is a soft delete — your completion history is preserved for analytics and the correlation engine, and the habit slot is freed so you can create a new one.
- **Pull to refresh** — pull down on the habit list to sync the latest data from the server.

---

### 2. Habits Tab

A comprehensive view of all your habits with science-backed metrics.

**What you see:**
- Header showing your total active habit count
- Each habit displayed as a card with:
  - **Streak Ring** — a circular indicator showing your current streak. Color-coded: gold (30+ days), green (7+ days), gray (under 7 days).
  - **Category Badge** — color-coded label (purple for Focus, indigo for Sleep, green for Exercise, orange for Nutrition, pink for Mindfulness)
  - **Current Streak** — number of consecutive days with a fire emoji
  - **Consistency Score** — a percentage calculated from your last 30 days of completions, weighted so recent days count more
  - **Checkbox** — to mark today's completion

**How to use:**
- Review your consistency scores to identify which habits need attention.
- Use the streak ring colors as quick visual motivation — aim to turn rings from gray to green (7+ days) and eventually gold (30+ days).
- The consistency score uses **recency-weighted scoring**, meaning yesterday's completion matters more than one from 3 weeks ago.

---

### 3. Journal Tab

Track your mental state and reflections with mood and energy logging.

**What you see:**
- Entry count at the top
- Past entries listed newest-first, each showing a mood emoji, timestamp, preview text (4 lines), and energy level label

**Mood Scale:**
| Rating | Emoji | Label |
|--------|-------|-------|
| 1 | 😟 | Very Low |
| 2 | 😔 | Low |
| 3 | 😐 | Moderate |
| 4 | 😊 | Good |
| 5 | 🤩 | Great |

**Energy Scale:**
| Rating | Label |
|--------|-------|
| 1 | Very Low |
| 2 | Low |
| 3 | Moderate |
| 4 | High |
| 5 | Very High |

**How to use:**
1. Tap the **+** button to create a new entry.
2. Write your reflection in the text area — "How was your day? What did you learn?"
3. Select your **mood** (1–5) by tapping one of the 5 emoji buttons.
4. Select your **energy level** (1–5) by tapping a number button.
5. Tap **Save** to store the entry.

**Why it matters:** Journaling combined with mood/energy tracking feeds into the AI Insights engine (Pro), which can detect correlations between your habits, mood patterns, and productivity.

---

### 4. Focus Tab (Pomodoro Timer)

A structured focus timer based on research-backed work/break cycles.

**Timer Presets:**
| Duration | Best For |
|----------|----------|
| 25 min | Standard Pomodoro — quick tasks, email batching |
| 45 min | Extended focus — writing, coding, studying |
| 90 min | Ultradian block — deep creative or analytical work (based on Peretz Lavie's 1985 research on 90-minute biological rhythms) |

**Session Types:**
- **Deep Work** — undistracted, cognitively demanding tasks
- **Study** — learning and review sessions
- **Creative** — writing, design, brainstorming
- **Admin** — email, planning, organizational tasks

**How to use:**
1. Select a **duration preset** (25, 45, or 90 minutes).
2. Choose a **session type** that matches your task.
3. Tap **Start** to begin the countdown.
4. The large circular timer shows remaining time in MM:SS format.
5. When the work session ends, a **break timer** starts automatically:
   - **5-minute break** after regular sessions
   - **15-minute break** after every 4th session (extended Pomodoro rest)
6. After the break, the timer resets for the next work session.
7. Use **Pause** to temporarily stop, **Resume** to continue, or **Reset** to start over.

**Interruption Logging (New):**
When you tap Pause during a work session, a bottom sheet appears asking "What interrupted you?" with four one-tap options:
- Phone — device notifications or calls
- Person — someone approaching you
- Thought — internal distraction or mind-wandering
- Other — anything else

Tap an option to log the interruption type and dismiss the sheet. You can also tap "Skip" to pause without logging. All interruption types are saved with the session and feed into your distraction analytics.

**Note:** You cannot change the duration or session type while the timer is running. Each completed session is saved with its type, duration, start/end times, and interruption types — feeding into your performance analytics.

---

### 5. Insights Tab (Pro Feature)

Performance analytics powered by your habit, focus, and journal data.

**Free users** see a locked preview with a blurred chart and an "Upgrade to Pro" button.

**Pro users** see:

#### Weekly Report Card
- **Overall Score** (0–100) displayed prominently in purple
- **Week-over-week delta** — shows improvement or decline vs. last week (e.g., "↑ +5" in green or "↓ -3" in red)
- **Score breakdown:**
  - **Habit Score** (40% weight) — difficulty-weighted completion rate (Easy habits count 0.5x, Moderate 1x, Hard 1.5x)
  - **Focus Score** (30% weight) — total focus minutes / 600-minute target, capped at 100
  - **Consistency Score** (30% weight) — days with any activity / 7 × 100

#### Performance Bar Chart
Three color-coded bars showing Habits (green), Focus (purple), and Consistency (orange) on a 0–100 scale.

#### 7-Day Habit Completion Heatmap
A grid with habits as rows and days of the week (Mon–Sun) as columns. Green dots indicate completed days; gray dots indicate missed days. Gives you a quick visual snapshot of your weekly rhythm.

#### Navigation Cards
- **AI Insights** (🧠) — tap to open the AI-powered analysis screen
- **Science Protocols** (🧬) — tap to browse evidence-based routines

---

### 6. Profile Tab

Account management, subscription status, and settings.

**What you see:**
- **Avatar** — circular display with the first letter of your name
- **Display name** and **subscription tier badge**:
  - Gray badge = Free
  - Purple badge = Pro
  - Gold badge = Lifetime
- **Account details** — email (authenticated status), timezone, member since date
- **Action buttons:**
  - "Upgrade to Pro" (Free users only)
  - "Restore Purchases" — recover an existing subscription on a new device
  - "Privacy Policy" — view the app's privacy policy
  - "Sign Out"

---

## Science-Backed Protocols

Accessible from the Insights tab or directly from the Protocols screen. Each protocol includes a summary, step-by-step instructions, and a peer-reviewed research citation.

### Free Protocols (Available to All Users)

#### 1. 90-Minute Ultradian Focus Block
- **Citation:** Peretz Lavie (1985) — ultradian rhythm research
- **Method:** Work in 90-minute blocks aligned with your biological rhythm, followed by 15–20 minute breaks. Aim for 3 blocks per day.
- **Steps:** Identify your peak window → set a 90-min timer → single-task → take a full break → repeat up to 3× daily.

#### 2. 2-Minute Rule / Tiny Habits
- **Citation:** BJ Fogg (2019) — Tiny Habits research
- **Method:** Scale any habit down to under 2 minutes. Anchor it after an existing routine. Celebrate immediately after completing it.
- **Steps:** Choose a habit → shrink it to 2 minutes → anchor after an existing behavior → celebrate → expand after 2 weeks of consistency.

#### 3. Caffeine Timing Optimizer
- **Citation:** Drake et al. (2013) — caffeine half-life study
- **Method:** Delay caffeine 90–120 minutes after waking (to let cortisol peak naturally). Cut off caffeine 8–10 hours before bedtime.
- **Steps:** Note your wake time → delay first caffeine → set a cutoff time → track energy levels in journal.

### Pro Protocols (Subscription Required)

#### 4. Spaced Repetition for Skill Learning
- **Citation:** Cepeda et al. (2006) — optimal spacing intervals
- **Method:** Review material at expanding intervals: 1 day, 3 days, 7 days, 14 days, 30 days.

#### 5. Morning Priming Protocol
- **Method:** 20-minute morning routine combining light exposure, breathing exercises, movement, journaling intentions, and delayed caffeine.

#### 6. Sleep Consistency Protocol
- **Method:** Maintain fixed sleep/wake times (±30 minutes), establish a wind-down ritual, optimize your sleep environment (cool, dark room).

#### 7. Zone 2 Cardio for Cognitive Performance
- **Citation:** Voss et al. (2013) — BDNF and cognitive function
- **Method:** 150–180 minutes per week of conversational-pace cardio to boost brain-derived neurotrophic factor (BDNF).

---

## AI Insights (Pro Feature)

An AI-powered analysis engine that examines 30 days of your anonymized habit, journal, and focus data to surface personalized insights.

**How to access:** Tap "AI Insights" from the Insights tab or the 🧠 card.

**What you get:**
- **Observations** (🔍) — patterns the AI notices in your data (e.g., "Your focus scores are consistently higher on days when you exercise in the morning")
- **Suggestions** (💡) — actionable recommendations based on your patterns
- **Correlations** (🔗) — connections between different areas of your data (e.g., mood vs. habit completion, sleep vs. focus duration)

**How it works:** The app sends anonymized data to a Supabase Edge Function, which calls Claude Sonnet to generate 3–5 personalized insights. If the AI service is unavailable, you'll see helpful generic insights as a fallback.

---

## Habit Correlation Engine (Pro Feature, New)

After 30+ days of data, the app computes Pearson correlations between your daily habit completions and your performance scores. This surfaces findings like: *"On days you complete Morning Movement, your score is 34% higher on average."*

**How it works:**
- For each habit, the engine builds a binary completion vector (1 = done, 0 = skipped) across the analysis window
- It correlates this against your daily overall performance score using Pearson's r
- Results are ranked by significance and strength

**Strength Badges:**
| |r| Range | Badge | Color |
|-----------|-------|-------|
| 0.50+ | Strong link | Green |
| 0.30–0.49 | Moderate link | Amber |
| 0.10–0.29 | Weak link | Gray |
| Below 0.10 | Not shown | — |

**Edge cases handled:**
- **High completers (>90%)** — too little variance to measure correlation. Shows: "You complete this habit too consistently to measure its isolated impact — that's a good sign."
- **Low completers (<10%)** — not enough data. Shows: "Complete this habit more consistently to unlock its impact score."
- **Negative correlations** — surfaced honestly as "negative link" (e.g., a late-night habit hurting next-day focus)

**Important:** The app uses "on days you complete X, your score tends to be Y% higher" — it never claims causation, only correlation.

---

## Streak Milestones & Sharing (New)

When you complete a habit and your streak hits a milestone, a celebratory share card appears:

| Milestone | Message |
|-----------|---------|
| 7 days | "One week strong!" |
| 14 days | "Two weeks of consistency!" |
| 30 days | "A full month — you're building something real." |
| 60 days | "60 days. Most people never get this far." |
| 100 days | "Triple digits. You're in the top 1%." |

The card shows a large streak count with fire emoji, your habit name, and the milestone message. Tap **Share** to open the native share sheet with a pre-formatted message, or **Dismiss** to close.

---

## Push Notifications

The app sends smart reminders to help maintain your streaks and optimize your timing:

| Notification | When | Message |
|--------------|------|---------|
| **Streak Protection** | 8 PM daily | "Don't break your X-day streak — complete [habit]!" |
| **Peak Performance** | 20 min before your ultradian peak | Reminder to start a focus session |
| **Morning Prime** | Your wake time | Cue for your morning routine |

**Limit:** Maximum 2 notifications per day to avoid notification fatigue.

---

## Subscription Plans

### Free Tier
- Up to 5 habits (with Easy/Moderate/Hard difficulty)
- Journal (unlimited entries)
- Focus timer (all presets and types) with interruption logging
- Basic streaks, consistency scores, and milestone celebrations
- 3 science protocols

### Pro — $7.99/month
Everything in Free, plus:
- Unlimited habits
- AI-powered insights (Claude-generated)
- Habit correlation engine (Pearson analysis)
- Performance analytics with difficulty-weighted scoring
- Weekly performance reports with deltas (auto-generated every Sunday)
- Journal export — tap "Export" in the journal header to share all entries as formatted text
- All 7 science protocols

### Annual — $49.99/year (Best Value)
Same as Pro at ~48% savings.

### Lifetime — $79.99 (one-time)
Permanent Pro access with no recurring charges.

**How to subscribe:**
1. Tap "Upgrade to Pro" on the Profile tab, or trigger the paywall by trying to add a 4th habit or accessing a Pro feature.
2. Review the 6 Pro features listed in the paywall modal.
3. Select a plan (monthly, annual, or lifetime). The annual plan is marked "BEST VALUE."
4. Tap "Subscribe Now" — payment is handled securely through Apple App Store or Google Play.
5. To recover a subscription on a new device, tap "Restore Purchases" on the Profile tab or in the paywall modal.

---

## Design & Interface

The app uses a **dark theme** optimized for readability and reduced eye strain:

| Element | Color |
|---------|-------|
| Background | Near-black (#0A0A0F) |
| Cards | Dark gray (#14141F) |
| Primary accent | Purple (#7C5CFC) |
| Success / Completed | Green (#22C55E) |
| Streaks / Warnings | Gold (#F59E0B) |
| Errors / Delete | Red (#EF4444) |
| Primary text | White (#FFFFFF) |
| Secondary text | Gray (#9CA3AF) |

**Category colors** provide visual organization:
- Focus → Purple
- Sleep → Indigo
- Exercise → Green
- Nutrition → Orange
- Mindfulness → Pink

---

## Typical Daily Workflow

1. **Morning** — Open the app, see your greeting and today's habits. Check the ones you've completed. Optionally start a focus session.
2. **During the day** — Use the focus timer for work sessions. The app tracks your deep work, study, creative, and admin time separately.
3. **Evening** — Complete remaining habits. Write a journal entry reflecting on your day, rating your mood and energy. The streak protection notification at 8 PM reminds you if habits are incomplete.
4. **Weekly** — Check the Insights tab (Pro) to review your weekly score, see how you're trending vs. last week, and read AI-generated insights about your patterns.
5. **Monthly** — Browse Science Protocols to adopt new evidence-based routines. Review your 30-day consistency scores on the Habits tab to identify areas for improvement.

---

## Privacy & Data

- All data is stored in Supabase with **Row Level Security (RLS)** — each user can only access their own data.
- AI Insights uses **anonymized data** — no personally identifiable information is sent to the AI.
- The app includes a built-in Privacy Policy screen accessible from the Profile tab.
- Authentication supports email/password and Apple Sign-In.

---

## Technical Highlights

- **Optimistic updates** — habit completions update the UI instantly, then sync in the background. Failed syncs roll back automatically with an error banner and retry option.
- **Offline-friendly demo mode** — the app works fully without a backend using mock data.
- **Error resilience** — a global error boundary catches render crashes, and inline error banners handle API/sync failures with retry and dismiss actions.
- **Accessibility** — all interactive elements have accessibility labels; the focus timer announces remaining time for screen readers.
- **Animated UI** — streak rings, progress indicators, and timer borders use React Native Reanimated for smooth 60fps animations.

---

## Platform Availability

- **iOS** — Full support including Apple Sign-In
- **Android** — Full support via React Native + Expo
- **Development** — Built with Expo SDK 55, React Native 0.83, TypeScript strict mode

---

*1000x — because the difference between average and exceptional is in the daily systems you build.*
