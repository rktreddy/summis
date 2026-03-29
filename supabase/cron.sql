-- Cron job configuration for Supabase
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor) to set up scheduled functions.
-- Requires the pg_cron and pg_net extensions (enabled by default on Supabase).

-- Enable extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1. Weekly Performance Report — Sundays at 8:00 AM UTC
-- Calls the weekly-report Edge Function which computes scores and sends push notifications.
-- The X-Cron-Secret header authenticates the request (must match CRON_SECRET env var in Edge Functions).
-- IMPORTANT: Replace <YOUR_CRON_SECRET> below with the same value you set via `supabase secrets set`.
select cron.schedule(
  'weekly-performance-report',
  '0 8 * * 0',  -- Every Sunday at 08:00 UTC
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/weekly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'X-Cron-Secret', '<YOUR_CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 2. Weekly Performance Score Batch — Saturdays at 11:00 PM UTC
-- Pre-computes scores for all users so Sunday's report has fresh data.
select cron.schedule(
  'weekly-score-batch',
  '0 23 * * 6',  -- Every Saturday at 23:00 UTC
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/performance-score',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'X-Cron-Secret', '<YOUR_CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove a job:
-- SELECT cron.unschedule('weekly-performance-report');
-- SELECT cron.unschedule('weekly-score-batch');
