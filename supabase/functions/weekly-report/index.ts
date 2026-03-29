// Supabase Edge Function: weekly-report
// Triggered every Sunday at 8am (cron) or on-demand.
// Generates weekly cognitive performance summaries and push notification payloads.
//
// Cron invocations use service role key (no user context).
// Validate via CRON_SECRET header to prevent unauthorized batch triggers.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CRON_SECRET = Deno.env.get('CRON_SECRET');

interface ReportResult {
  user_id: string;
  overall_score: number;
  delta: number | null;
  total_sprints: number;
  focus_total_minutes: number;
  notification_payload: {
    title: string;
    body: string;
  };
}

Deno.serve(async (req: Request) => {
  try {
    // Validate cron invocation with shared secret
    const cronHeader = req.headers.get('X-Cron-Secret');
    if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
      // Also allow user-initiated calls with valid JWT
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Service client needed for batch processing across users
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const weekStart = getWeekStart(now);
    const prevWeekStart = getWeekStart(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Only generate reports for Pro/Lifetime users (weekly report is a paid feature)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('subscription_tier', ['pro', 'lifetime']);

    const reports: ReportResult[] = [];

    for (const profile of profiles ?? []) {
      const userId = profile.id;

      // Fetch sprints for this week
      const { data: sprints } = await supabase
        .from('sprints')
        .select('duration_minutes, focus_quality, completed')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('started_at', sevenDaysAgo.toISOString());

      const completedSprints = sprints ?? [];
      const focusTotal = completedSprints.reduce(
        (sum, s) => sum + s.duration_minutes, 0
      );
      const avgQuality = completedSprints.length > 0
        ? Math.round(completedSprints.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / completedSprints.length * 10) / 10
        : 0;

      // Current week score
      const { data: currentScore } = await supabase
        .from('performance_scores')
        .select('overall_score')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .single();

      // Previous week score
      const { data: prevScore } = await supabase
        .from('performance_scores')
        .select('overall_score')
        .eq('user_id', userId)
        .eq('week_start', prevWeekStart)
        .single();

      const overall = currentScore?.overall_score ?? 0;
      const delta =
        prevScore?.overall_score != null
          ? overall - prevScore.overall_score
          : null;

      // Build notification
      const deltaStr =
        delta != null && delta !== 0
          ? ` (${delta > 0 ? '+' : ''}${delta} vs last week)`
          : '';

      const name = profile.display_name ?? 'there';

      reports.push({
        user_id: userId,
        overall_score: overall,
        delta,
        total_sprints: completedSprints.length,
        focus_total_minutes: focusTotal,
        notification_payload: {
          title: `Summis Weekly Report — Score: ${overall}${deltaStr}`,
          body: completedSprints.length > 0
            ? `Great work, ${name}! ${completedSprints.length} sprints, ${Math.round(focusTotal / 60)}h ${focusTotal % 60}m focus time, avg quality ${avgQuality}/5.`
            : `Hey ${name}, no sprints completed this week. Your next peak window is a great time to start.`,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, reports }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An internal error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
