// Supabase Edge Function: weekly-report
// Triggered every Sunday at 8am (cron) or on-demand.
// Generates weekly performance summaries and push notification payloads.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface ReportResult {
  user_id: string;
  overall_score: number;
  delta: number | null;
  top_habit: string | null;
  focus_total_minutes: number;
  notification_payload: {
    title: string;
    body: string;
  };
}

Deno.serve(async (_req: Request) => {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const prevWeekStart = getWeekStart(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name');

    const reports: ReportResult[] = [];

    for (const profile of profiles ?? []) {
      const userId = profile.id;

      // Current week score
      const { data: currentScore } = await supabase
        .from('performance_scores')
        .select('overall_score, habit_score, focus_score, consistency_score')
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

      // Top habit: most completions this week
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', userId)
        .gte('completed_at', sevenDaysAgo.toISOString());

      let topHabit: string | null = null;
      if (completions && completions.length > 0) {
        const counts = new Map<string, number>();
        for (const c of completions) {
          counts.set(c.habit_id, (counts.get(c.habit_id) ?? 0) + 1);
        }
        const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (topId) {
          const { data: habit } = await supabase
            .from('habits')
            .select('title')
            .eq('id', topId)
            .single();
          topHabit = habit?.title ?? null;
        }
      }

      // Total focus minutes
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('started_at', sevenDaysAgo.toISOString());

      const focusTotal = (sessions ?? []).reduce(
        (sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes,
        0
      );

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
        top_habit: topHabit,
        focus_total_minutes: focusTotal,
        notification_payload: {
          title: `1000x Weekly Report \u2014 Score: ${overall}${deltaStr}`,
          body: topHabit
            ? `Great job, ${name}! Top habit: ${topHabit}. Total focus: ${Math.round(focusTotal / 60)}h ${focusTotal % 60}m.`
            : `Hey ${name}, your weekly score is ${overall}. Keep building those habits!`,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, reports }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
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
