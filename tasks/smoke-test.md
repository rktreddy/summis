# Summis Pre-Submission Smoke Test

Run through this checklist on a physical device (iOS + Android) before submitting to stores.

## Auth Flow
- [ ] Fresh install → lands on login screen
- [ ] Email sign-up creates account and lands on onboarding
- [ ] Apple Sign-In works (iOS only)
- [ ] Sign out and sign back in → lands on Today tab
- [ ] Account deletion removes all data (Settings → Delete Account)

## Onboarding (7 steps)
- [ ] Welcome screen displays correctly
- [ ] Chronotype selection (all 3 options responsive)
- [ ] Energy preview updates when wake time changes
- [ ] Notification audit — "Open notification settings" link opens system settings
- [ ] Phone placement selection works
- [ ] Sprint schedule (duration + daily target) selectable
- [ ] Ready screen shows correct summary of all choices
- [ ] "Start using Summis" completes onboarding and lands on Today tab
- [ ] Back button works on every step

## Today Tab
- [ ] Greeting shows correct time of day + display name
- [ ] Hygiene score card shows 0% initially, tapping expands checklist
- [ ] Toggling hygiene practices updates score in real-time
- [ ] Add MIT (title + time estimate) → appears in list
- [ ] Toggle MIT completed → strikethrough
- [ ] Delete MIT → removed from list
- [ ] Cannot add more than 3 MITs
- [ ] Sprint schedule card shows correct daily target
- [ ] "Start Sprint" navigates to Sprint tab
- [ ] Evening reflection (after 6 PM): day rating + note saves correctly

## Sprint Flow (4 phases)
- [ ] Intention screen: can write intention, select MIT link, check hygiene items
- [ ] "Begin Sprint" starts timer
- [ ] Timer counts down correctly (test with short duration)
- [ ] Pause → interruption logger appears (Phone/Person/Thought/Other)
- [ ] Resume continues timer
- [ ] Timer completion → transitions to Rest phase
- [ ] Rest phase: suggestions display, min rest enforced
- [ ] "Ready for reflection" → transitions to Reflection phase
- [ ] Reflection: quality 1-5, intention met, optional note
- [ ] "Done" → returns to idle, sprint appears in Today tab history
- [ ] Free tier: 4th sprint blocked with upgrade prompt

## Score Tab
- [ ] 7-day average score displays
- [ ] Delta (vs previous week) shows correctly
- [ ] Trend label (Rising/Plateau/Declining) displays
- [ ] 30-day chart renders with daily dots + rolling average lines
- [ ] Weekly summary shows correct sprint count, focus time, avg quality
- [ ] Time-of-day breakdown shows morning/afternoon/evening bars
- [ ] Free tier: correlation section shows locked/paywall card
- [ ] Pro tier: after 30 days, correlation cards display real insights

## Subscriptions
- [ ] Paywall modal opens when hitting Pro features
- [ ] 3 plans displayed (Monthly $7.99, Annual $49.99, Lifetime $79.99)
- [ ] Purchase flow completes (use sandbox/test accounts)
- [ ] Restore purchases works
- [ ] Pro features unlock after purchase

## Notifications
- [ ] Push notification permission requested after onboarding
- [ ] Energy phase notification fires before peak window
- [ ] Streak reminder fires at 8 PM (if no sprint completed today)
- [ ] Morning prime notification fires at wake time

## Offline / Edge Cases
- [ ] App works in airplane mode (demo data loads)
- [ ] Sprint started → close app → reopen → sprint recovers
- [ ] Data syncs when connection restored
- [ ] Error banner appears on network failure (dismissible)

## Privacy & Legal
- [ ] Privacy policy accessible from profile/settings
- [ ] Privacy policy renders all 11 sections
- [ ] Account deletion note present in privacy policy

## Visual / Polish
- [ ] Dark theme consistent across all screens
- [ ] No layout jumps or flash of unstyled content
- [ ] Splash screen displays correctly
- [ ] App icon correct on home screen
- [ ] Text legible on small screens (iPhone SE / small Android)
- [ ] Scroll works on all long-content screens
