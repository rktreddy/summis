// Supabase Edge Function: ai-insights
// Calls Claude API to generate personalized cognitive performance insights.
// Requires ANTHROPIC_API_KEY in Supabase secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface InsightRequest {
  user_id: string;
}

interface Insight {
  title: string;
  body: string;
  type: 'observation' | 'suggestion' | 'correlation';
}

/** Create a Supabase client scoped to the authenticated user's JWT. */
function createUserClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

/** Create a service-role client (only for cron/batch operations). */
function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

Deno.serve(async (req: Request) => {
  try {
    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use the user's JWT for all queries — RLS enforces data access
    const supabase = createUserClient(authHeader);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { user_id }: InsightRequest = await req.json();

    if (!user_id || user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'user_id required and must match authenticated user' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify Pro/Lifetime subscription — AI insights is a paid feature
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user_id)
      .single();

    if (!profile || profile.subscription_tier === 'free') {
      return new Response(
        JSON.stringify({ error: 'AI Insights requires a Pro subscription' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ insights: getFallbackInsights() }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Gather user data — RLS ensures only this user's data is returned
    const [sprintsRes, mitsRes, hygieneRes, scoresRes] =
      await Promise.all([
        supabase
          .from('sprints')
          .select('id, date, intention, duration_minutes, completed, focus_quality, intention_met, interruptions')
          .eq('user_id', user_id)
          .gte('started_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('mits')
          .select('id, date, title, estimated_minutes, completed')
          .eq('user_id', user_id)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('hygiene_logs')
          .select('practice, date, compliant')
          .eq('user_id', user_id)
          .gte('logged_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('performance_scores')
          .select('week_start, overall_score, habit_score, focus_score, consistency_score')
          .eq('user_id', user_id)
          .order('week_start', { ascending: false })
          .limit(4),
      ]);

    const dataSummary = {
      sprints: {
        total: (sprintsRes.data ?? []).length,
        completed: (sprintsRes.data ?? []).filter((s) => s.completed).length,
        avg_focus_quality: (() => {
          const rated = (sprintsRes.data ?? []).filter((s) => s.focus_quality != null);
          return rated.length > 0
            ? Math.round(rated.reduce((sum, s) => sum + (s.focus_quality ?? 0), 0) / rated.length * 10) / 10
            : null;
        })(),
        total_minutes: (sprintsRes.data ?? []).reduce(
          (sum, s) => sum + (s.completed ? s.duration_minutes : 0), 0
        ),
      },
      mits: {
        total: (mitsRes.data ?? []).length,
        completed: (mitsRes.data ?? []).filter((m) => m.completed).length,
      },
      hygiene_compliance: (() => {
        const logs = hygieneRes.data ?? [];
        return logs.length > 0
          ? Math.round(logs.filter((l) => l.compliant).length / logs.length * 100)
          : null;
      })(),
      weekly_scores: scoresRes.data ?? [],
    };

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are an AI cognitive performance coach for the Summis app. Analyze this user's sprint, MIT, and cognitive hygiene data from the last 30 days and generate 3-5 personalized insights.

User data:
${JSON.stringify(dataSummary, null, 2)}

Return a JSON array of insights, each with:
- "title": short headline (max 60 chars)
- "body": 2-3 sentence explanation with specific, actionable advice
- "type": one of "observation", "suggestion", or "correlation"

Focus on:
1. Patterns in sprint quality and cognitive hygiene compliance
2. Correlations between hygiene practices and focus quality
3. Specific, science-backed suggestions for improvement
4. Celebrating wins and positive trends

Use language like "your data suggests" or "on days when you X, your focus tends to be Y% higher" — correlation, not causation. Return ONLY the JSON array, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error status:', response.status);
      return new Response(
        JSON.stringify({ insights: getFallbackInsights() }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text ?? '[]';

    let insights: Insight[];
    try {
      insights = JSON.parse(content);
    } catch {
      insights = getFallbackInsights();
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred', insights: getFallbackInsights() }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackInsights(): Insight[] {
  return [
    {
      title: 'Keep building your data',
      body: 'Complete sprints and log your cognitive hygiene practices consistently for at least 7 days. The AI needs enough data points to find meaningful patterns in your performance.',
      type: 'suggestion',
    },
    {
      title: 'Your phone placement matters',
      body: 'Research shows that even a silent phone on your desk reduces working memory capacity. Try keeping it in another room during your next sprint and see how your focus quality compares.',
      type: 'observation',
    },
  ];
}
