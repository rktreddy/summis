// Supabase Edge Function: delete-account
// Deletes a user's account and all associated data.
// Requires authenticated user JWT.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreFlight, corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  const preflightResponse = handleCorsPreFlight(req);
  if (preflightResponse) return preflightResponse;

  const origin = req.headers.get('Origin');
  const headers = corsHeaders(origin);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers }
      );
    }

    // Verify the user via their JWT
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers }
      );
    }

    // Use service role to delete user data and auth account
    // (RLS prevents users from deleting their own auth record)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userId = user.id;
    console.log(`[delete-account] Starting delete for user ${userId}`);

    // Delete user data from all tables (cascade should handle most,
    // but explicit deletion ensures nothing is missed)
    const tables = [
      'hygiene_logs',
      'hygiene_configs',
      'mits',
      'sprints',
      'daily_plans',
      'habit_completions',
      'habits',
      'journal_entries',
      'focus_sessions',
      'performance_scores',
      'daily_scores',
      'active_protocols',
      'skill_logs',
      'accountability_partners',
      'streak_challenges',
    ];

    for (const table of tables) {
      const { error: tableError } = await serviceClient.from(table).delete().eq('user_id', userId);
      if (tableError) {
        console.error(`[delete-account] Failed to delete from ${table}: ${tableError.message}`);
      }
    }

    // Delete the profile
    const { error: profileError } = await serviceClient.from('profiles').delete().eq('id', userId);
    if (profileError) {
      console.error(`[delete-account] Failed to delete profile: ${profileError.message}`);
      return new Response(
        JSON.stringify({ error: `Profile delete failed: ${profileError.message}` }),
        { status: 500, headers }
      );
    }

    // Delete the auth user
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(`[delete-account] Failed to delete auth user: ${deleteError.message}`);
      return new Response(
        JSON.stringify({ error: `Auth delete failed: ${deleteError.message}` }),
        { status: 500, headers }
      );
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account and all data deleted.' }),
      { headers }
    );
  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers }
    );
  }
});
