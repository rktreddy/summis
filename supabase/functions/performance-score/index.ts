// Supabase Edge Function: performance-score
// Computes weekly performance scores for a specific user (via JWT) or all users (cron).
// Trigger: cron (weekly) or on-demand via POST with { user_id }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreFlight, corsHeaders } from '../_shared/cors.ts';

const CRON_SECRET = Deno.env.get('CRON_SECRET');

interface ScoreInput {
  user_id?: string;
}

/** Create a Supabase client scoped to the authenticated user's JWT. */
function createUserClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

Deno.serve(async (req: Request) => {
  const preflightResponse = handleCorsPreFlight(req);
  if (preflightResponse) return preflightResponse;

  const origin = req.headers.get('Origin');
  const headers = corsHeaders(origin);

  try {
    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('X-Cron-Secret');
    const body: ScoreInput = req.method === 'POST' ? await req.json() : {};

    let userIds: string[] = [];
    let supabase;

    if (body.user_id) {
      // User-initiated: require valid JWT matching the user_id
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Missing authorization' }),
          { status: 401, headers }
        );
      }

      supabase = createUserClient(authHeader);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user || user.id !== body.user_id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers }
        );
      }

      userIds = [body.user_id];
    } else {
      // Batch mode (cron) — validate cron secret
      if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers }
        );
      }

      // Service client for batch operations
      supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

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
      // Fetch completed sprints
      const { data: sprints } = await supabase
        .from('sprints')
        .select('id, duration_minutes, focus_quality, completed, date')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('started_at', sevenDaysAgo.toISOString());

      const completedSprints = sprints ?? [];
      const dailyTarget = 3; // Default; could fetch from profile

      // Sprint completion score (30%)
      const sprintCompletion = Math.min(
        Math.round((completedSprints.length / (dailyTarget * 7)) * 100), 100
      );

      // Focus quality score (30%)
      const rated = completedSprints.filter((s) => s.focus_quality != null);
      const focusQuality = rated.length > 0
        ? Math.round(rated.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / rated.length * 20)
        : 0;

      // Hygiene compliance score (25%)
      const { data: hygieneLogs } = await supabase
        .from('hygiene_logs')
        .select('compliant')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      const logs = hygieneLogs ?? [];
      const hygieneScore = logs.length > 0
        ? Math.round(logs.filter((l) => l.compliant).length / logs.length * 100)
        : 0;

      // MIT completion score (15%)
      const { data: mits } = await supabase
        .from('mits')
        .select('completed')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      const allMits = mits ?? [];
      const mitScore = allMits.length > 0
        ? Math.round(allMits.filter((m) => m.completed).length / allMits.length * 100)
        : 0;

      // Weighted overall (matches CLAUDE.md formula)
      const overallScore = Math.min(100, Math.round(
        sprintCompletion * 0.3 + focusQuality * 0.3 + hygieneScore * 0.25 + mitScore * 0.15
      ));

      // Consistency score (bonus metric)
      const daysWithSprints = new Set(completedSprints.map((s) => s.date));
      const consistencyScore = Math.round((daysWithSprints.size / 7) * 100);

      // Upsert
      const { data: saved } = await supabase
        .from('performance_scores')
        .upsert(
          {
            user_id: userId,
            week_start: weekStart,
            overall_score: overallScore,
            habit_score: hygieneScore,
            focus_score: focusQuality,
            consistency_score: consistencyScore,
          },
          { onConflict: 'user_id,week_start' }
        )
        .select('id, overall_score')
        .single();

      results.push({ user_id: userId, score: saved?.overall_score });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers,
    });
  } catch (error) {
    console.error('Performance score error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An internal error occurred' }),
      { status: 500, headers }
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
