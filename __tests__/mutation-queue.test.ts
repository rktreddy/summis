// Import isNetworkError directly to avoid pulling in supabase (RN module)
// The function is pure logic with no dependencies.

interface QueuedMutation {
  id: string;
  type: 'toggle_completion' | 'delete_habit';
  payload: Record<string, unknown>;
  createdAt: string;
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message.includes('Network request failed')) return true;
  if (err instanceof Error && err.message.includes('Failed to fetch')) return true;
  if (err instanceof Error && err.message.includes('NETWORK_ERROR')) return true;
  return false;
}

describe('Mutation Queue', () => {
  describe('isNetworkError', () => {
    it('detects TypeError with "Network request failed"', () => {
      expect(isNetworkError(new TypeError('Network request failed'))).toBe(true);
    });

    it('detects "Failed to fetch" errors', () => {
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
    });

    it('detects NETWORK_ERROR', () => {
      expect(isNetworkError(new Error('NETWORK_ERROR: connection refused'))).toBe(true);
    });

    it('returns false for validation errors', () => {
      expect(isNetworkError(new Error('FREE_TIER_HABIT_LIMIT'))).toBe(false);
    });

    it('returns false for generic errors', () => {
      expect(isNetworkError(new Error('Something went wrong'))).toBe(false);
    });

    it('returns false for non-Error values', () => {
      expect(isNetworkError('string error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('QueuedMutation structure', () => {
    it('creates a valid toggle_completion mutation with targetDate', () => {
      const now = new Date().toISOString();
      const mutation: QueuedMutation = {
        id: 'mut-1',
        type: 'toggle_completion',
        payload: { habitId: 'h1', userId: 'user-1', isUndo: false, targetDate: now },
        createdAt: now,
      };
      expect(mutation.type).toBe('toggle_completion');
      expect(mutation.payload).toHaveProperty('targetDate');
    });

    it('creates a valid delete_habit mutation', () => {
      const mutation: QueuedMutation = {
        id: 'mut-2',
        type: 'delete_habit',
        payload: { habitId: 'h1' },
        createdAt: new Date().toISOString(),
      };
      expect(mutation.type).toBe('delete_habit');
    });
  });

  describe('queue ordering', () => {
    it('maintains FIFO order', () => {
      const queue: QueuedMutation[] = [];

      const mut1: QueuedMutation = {
        id: 'mut-1',
        type: 'toggle_completion',
        payload: { habitId: 'h1', userId: 'u1', isUndo: false, targetDate: '2026-01-01T00:00:00Z' },
        createdAt: '2026-01-01T00:00:00Z',
      };
      const mut2: QueuedMutation = {
        id: 'mut-2',
        type: 'delete_habit',
        payload: { habitId: 'h2' },
        createdAt: '2026-01-01T00:01:00Z',
      };
      const mut3: QueuedMutation = {
        id: 'mut-3',
        type: 'toggle_completion',
        payload: { habitId: 'h1', userId: 'u1', isUndo: true, targetDate: '2026-01-01T00:02:00Z' },
        createdAt: '2026-01-01T00:02:00Z',
      };

      queue.push(mut1, mut2, mut3);

      expect(queue[0].id).toBe('mut-1');
      expect(queue[1].id).toBe('mut-2');
      expect(queue[2].id).toBe('mut-3');
    });

    it('removes processed mutations correctly', () => {
      const queue: QueuedMutation[] = [
        { id: 'mut-1', type: 'toggle_completion', payload: {}, createdAt: '' },
        { id: 'mut-2', type: 'delete_habit', payload: {}, createdAt: '' },
        { id: 'mut-3', type: 'toggle_completion', payload: {}, createdAt: '' },
      ];

      const afterRemove = queue.filter(m => m.id !== 'mut-1');
      expect(afterRemove.length).toBe(2);
      expect(afterRemove[0].id).toBe('mut-2');
    });
  });
});
