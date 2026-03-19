// Supabase Edge Function: performance-score
// Computes weekly performance scores for all users or a specific user.
// Trigger: cron (weekly) or on-demand via POST with { user_id }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface ScoreInput {
  user_id?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Verify auth — either service role (cron) or user token
    const authHeader = req.headers.get('Authorization');
    const body: ScoreInput = req.method === 'POST' ? await req.json() : {};

    // Get users to process
    let userIds: string[] = [];

    if (body.user_id) {
      // If called with a specific user_id, verify the caller owns it
      if (authHeader) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (authError || !user || user.id !== body.user_id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      userIds = [body.user_id];
    } else {
      // Batch mode (cron) — no user_id means process all (service role only)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');
      userIds = (profiles ?? []).map((p: { id: string }) => p.id);
    }

    const now = new Date();
    const weekStart = getWeekStart(now);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = [];

    for (const userId of userIds) {
      // Fetch habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true);

      const habitIds = (habits ?? []).map((h: { id: string }) => h.id);

      // Fetch completions
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('id, habit_id, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', sevenDaysAgo.toISOString());

      // Habit score
      const totalPossible = habitIds.length * 7;
      let totalCompleted = 0;

      for (const habitId of habitIds) {
        const habitCompletions = (completions ?? []).filter(
          (c: { habit_id: string }) => c.habit_id === habitId
        );
        const uniqueDays = new Set(
          habitCompletions.map((c: { completed_at: string }) =>
            new Date(c.completed_at).toDateString()
          )
        );
        totalCompleted += uniqueDays.size;
      }

      const habitScore =
        totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      // Focus score
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('started_at', sevenDaysAgo.toISOString());

      const totalMinutes = (sessions ?? []).reduce(
        (sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes,
        0
      );
      const focusScore = Math.min(100, Math.round((totalMinutes / 600) * 100));

      // Consistency score
      const daysWithActivity = new Set<string>();
      for (const c of completions ?? []) {
        daysWithActivity.add(new Date((c as { completed_at: string }).completed_at).toDateString());
      }
      const consistencyScore = Math.round((daysWithActivity.size / 7) * 100);

      // Overall
      const overallScore = Math.round(
        habitScore * 0.4 + focusScore * 0.3 + consistencyScore * 0.3
      );

      // Upsert
      const { data: saved } = await supabase
        .from('performance_scores')
        .upsert(
          {
            user_id: userId,
            week_start: weekStart,
            overall_score: overallScore,
            habit_score: habitScore,
            focus_score: focusScore,
            consistency_score: consistencyScore,
          },
          { onConflict: 'user_id,week_start' }
        )
        .select('id, overall_score')
        .single();

      results.push({ user_id: userId, score: saved?.overall_score });
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
