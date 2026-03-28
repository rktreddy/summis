import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

export interface QueuedMutation {
  id: string;
  type: 'toggle_completion' | 'delete_habit';
  payload: Record<string, unknown>;
  createdAt: string;
}

/** Returns true if the error looks like a network failure (not a validation/server error). */
export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message.includes('Network request failed')) return true;
  if (err instanceof Error && err.message.includes('Failed to fetch')) return true;
  if (err instanceof Error && err.message.includes('NETWORK_ERROR')) return true;
  return false;
}

/**
 * Process queued mutations sequentially on reconnect.
 * Stops on first failure to maintain ordering guarantees.
 * Returns the number of successfully processed mutations.
 */
export async function processMutationQueue(): Promise<number> {
  const { mutationQueue, removeMutation } = useAppStore.getState();

  if (mutationQueue.length === 0) return 0;

  let processed = 0;

  for (const mutation of mutationQueue) {
    try {
      await executeMutation(mutation);
      removeMutation(mutation.id);
      processed++;
    } catch (err) {
      // Stop on first failure — maintain queue order
      console.error('Mutation queue: failed to process', mutation.type, err);
      break;
    }
  }

  return processed;
}

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  switch (mutation.type) {
    case 'toggle_completion': {
      const { habitId, userId, isUndo, targetDate } = mutation.payload as {
        habitId: string;
        userId: string;
        isUndo: boolean;
        targetDate: string; // ISO date string captured at enqueue time
      };
      if (isUndo) {
        // Use the target date from enqueue time, not the current date
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const { data: completions } = await supabase
          .from('habit_completions')
          .select('id, completed_at')
          .eq('habit_id', habitId)
          .eq('user_id', userId)
          .gte('completed_at', dayStart.toISOString())
          .lt('completed_at', dayEnd.toISOString());
        if (completions?.[0]) {
          await supabase.from('habit_completions').delete().eq('id', completions[0].id);
        }
      } else {
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: userId,
        });
      }
      break;
    }
    case 'delete_habit': {
      const { habitId } = mutation.payload as { habitId: string };
      await supabase.from('habits').update({ is_active: false }).eq('id', habitId);
      break;
    }
    default:
      console.warn('Mutation queue: unknown type', mutation.type);
  }
}
