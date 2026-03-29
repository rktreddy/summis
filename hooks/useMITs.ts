import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { getTodayString } from '@/lib/date-utils';
import type { MIT } from '@/types/summis';

const MAX_MITS_PER_DAY = 3;

export function useMITs() {
  const session = useAppStore((s) => s.session);
  const mits = useAppStore((s) => s.mits);
  const addMIT = useAppStore((s) => s.addMIT);
  const updateMIT = useAppStore((s) => s.updateMIT);
  const removeMIT = useAppStore((s) => s.removeMIT);
  const setError = useAppStore((s) => s.setError);
  const data = useData();

  const todayStr = useMemo(() => getTodayString(), []);
  const todayMITs = useMemo(
    () => mits.filter((m) => m.date === todayStr).sort((a, b) => a.sort_order - b.sort_order),
    [mits, todayStr]
  );
  const completedMITs = useMemo(
    () => todayMITs.filter((m) => m.completed),
    [todayMITs]
  );
  const canAddMIT = todayMITs.length < MAX_MITS_PER_DAY;

  const createMIT = useCallback(
    async (title: string, estimatedMinutes: number): Promise<MIT | null> => {
      const userId = session?.user?.id;
      if (!userId || !canAddMIT) return null;

      const mitData = {
        date: todayStr,
        title,
        estimated_minutes: estimatedMinutes,
        sort_order: todayMITs.length + 1,
      };

      // Optimistic: add to store immediately
      const optimisticMIT: MIT = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...mitData,
        actual_minutes: null,
        completed: false,
        completed_at: null,
        sprint_id: null,
        created_at: new Date().toISOString(),
      };

      addMIT(optimisticMIT);

      // Sync to backend
      try {
        const saved = await data.createMIT(userId, mitData);
        if (saved.id !== optimisticMIT.id) {
          // Replace optimistic with server version
          updateMIT(optimisticMIT.id, { ...saved });
        }
        return saved;
      } catch (err) {
        setError('MIT saved locally but failed to sync.');
        return optimisticMIT;
      }
    },
    [session, todayStr, todayMITs.length, canAddMIT, addMIT, updateMIT, setError, data]
  );

  const toggleMIT = useCallback(
    async (id: string) => {
      const mit = mits.find((m) => m.id === id);
      if (!mit) return;

      const updates = mit.completed
        ? { completed: false, completed_at: null }
        : { completed: true, completed_at: new Date().toISOString() };

      // Optimistic update
      updateMIT(id, updates);

      // Sync to backend
      try {
        await data.updateMIT(id, updates);
      } catch (err) {
        // Rollback
        updateMIT(id, { completed: mit.completed, completed_at: mit.completed_at });
        setError('Failed to update MIT. Change has been reverted.');
      }
    },
    [mits, updateMIT, setError, data]
  );

  const deleteMIT = useCallback(
    (id: string) => {
      removeMIT(id);
      // TODO: add data.deleteMIT when available
    },
    [removeMIT]
  );

  return {
    todayMITs,
    completedMITs,
    canAddMIT,
    createMIT,
    toggleMIT,
    deleteMIT,
    maxMITs: MAX_MITS_PER_DAY,
  };
}
