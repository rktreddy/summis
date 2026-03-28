// Supabase Edge Function: ai-insights
// Calls Claude API to generate personalized insights from user data.
// Requires ANTHROPIC_API_KEY in Supabase secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface InsightRequest {
  user_id: string;
}

interface Insight {
  title: string;
  body: string;
  type: 'observation' | 'suggestion' | 'correlation';
}

Deno.serve(async (req: Request) => {
  try {
    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
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

    // Gather user data
    const [habitsRes, completionsRes, journalRes, focusRes, scoresRes] =
      await Promise.all([
        supabase
          .from('habits')
          .select('id, title, category')
          .eq('user_id', user_id)
          .eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('habit_id, completed_at')
          .eq('user_id', user_id)
          .gte('completed_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('journal_entries')
          .select('content, mood, energy_level, created_at')
          .eq('user_id', user_id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('focus_sessions')
          .select('duration_minutes, session_type, started_at, completed')
          .eq('user_id', user_id)
          .gte('started_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('performance_scores')
          .select('week_start, overall_score, habit_score, focus_score, consistency_score')
          .eq('user_id', user_id)
          .order('week_start', { ascending: false })
          .limit(4),
      ]);

    const dataSummary = {
      habits: habitsRes.data ?? [],
      completions_count: (completionsRes.data ?? []).length,
      journal_entries: (journalRes.data ?? []).map((e) => ({
        mood: e.mood,
        energy: e.energy_level,
        date: e.created_at,
        word_count: e.content.split(/\s+/).length,
      })),
      focus_sessions: {
        total: (focusRes.data ?? []).length,
        completed: (focusRes.data ?? []).filter((s) => s.completed).length,
        total_minutes: (focusRes.data ?? []).reduce(
          (sum, s) => sum + (s.completed ? s.duration_minutes : 0),
          0
        ),
      },
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
            content: `You are an AI performance coach for the 1000x productivity app. Analyze this user's data from the last 30 days and generate 3-5 personalized insights.

User data:
${JSON.stringify(dataSummary, null, 2)}

Return a JSON array of insights, each with:
- "title": short headline (max 60 chars)
- "body": 2-3 sentence explanation with specific, actionable advice
- "type": one of "observation", "suggestion", or "correlation"

Focus on:
1. Patterns in their habit completion timing and consistency
2. Correlations between mood/energy and habits or focus sessions
3. Specific, science-backed suggestions for improvement
4. Celebrating wins and positive trends

Be encouraging but honest. Reference specific data points. Return ONLY the JSON array, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
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
      JSON.stringify({ error: String(error), insights: getFallbackInsights() }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackInsights(): Insight[] {
  return [
    {
      title: 'Keep building your data',
      body: 'Log habits, journal entries, and focus sessions consistently for at least 7 days. The AI needs enough data points to find meaningful patterns.',
      type: 'suggestion',
    },
    {
      title: 'Morning habits drive afternoon focus',
      body: 'Research shows that completing keystone habits early in the day creates positive momentum. Try to complete at least one habit before 9 AM.',
      type: 'observation',
    },
  ];
}
