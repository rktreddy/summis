import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useData } from '@/lib/data-provider';
import { getTodayString } from '@/lib/date-utils';
import { canStartSprint } from '@/lib/features';
import { scheduleStreakReminder } from '@/lib/notifications';
import type { Sprint, SprintPhase } from '@/types/summis';

export function useSprints() {
  const session = useAppStore((s) => s.session);
  const sprints = useAppStore((s) => s.sprints);
  const addSprint = useAppStore((s) => s.addSprint);
  const updateSprint = useAppStore((s) => s.updateSprint);
  const activeSprint = useAppStore((s) => s.activeSprint);
  const setActiveSprint = useAppStore((s) => s.setActiveSprint);
  const setError = useAppStore((s) => s.setError);
  const data = useData();

  const todayStr = useMemo(() => getTodayString(), []);
  const todaySprints = useMemo(
    () => sprints.filter((s) => s.date === todayStr),
    [sprints, todayStr]
  );
  const completedToday = useMemo(
    () => todaySprints.filter((s) => s.completed),
    [todaySprints]
  );

  // Compute sprint streak (consecutive days with at least 1 completed sprint)
  const sprintStreak = useMemo(() => {
    const dates = new Set(
      sprints.filter((s) => s.completed).map((s) => s.date)
    );
    let streak = 0;
    const d = new Date();
    if (!dates.has(todayStr)) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      if (dates.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [sprints, todayStr]);

  const startSprint = useCallback(
    async (params: {
      intention: string;
      durationMinutes: number;
      phoneAway: boolean;
      dndEnabled: boolean;
      environmentReady: boolean;
      mitId?: string;
    }): Promise<Sprint> => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Validate intention
      const trimmedIntention = params.intention.trim();
      if (!trimmedIntention) throw new Error('Intention cannot be empty');
      if (trimmedIntention.length > 500) throw new Error('Intention too long (max 500 characters)');

      // Enforce sprint limit server-side check
      const profile = useAppStore.getState().profile;
      const tier = (profile?.subscription_tier ?? 'free') as 'free' | 'pro' | 'lifetime';
      if (!canStartSprint(tier, todaySprints.length)) {
        throw new Error('Daily sprint limit reached. Upgrade to Pro for unlimited sprints.');
      }

      const sprintData = {
        date: todayStr,
        intention: params.intention,
        duration_minutes: params.durationMinutes,
        phase: 'focus' as SprintPhase,
        started_at: new Date().toISOString(),
        ended_at: null,
        completed: false,
        phone_away: params.phoneAway,
        dnd_enabled: params.dndEnabled,
        environment_ready: params.environmentReady,
        focus_quality: null,
        intention_met: null,
        reflection_note: null,
        interruptions: 0,
        interruption_types: [] as string[],
        mit_id: params.mitId ?? null,
      };

      // Optimistic: add to store immediately
      const optimisticSprint: Sprint = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...sprintData,
      };
      addSprint(optimisticSprint);
      setActiveSprint(optimisticSprint);

      // Sync to backend
      try {
        const saved = await data.createSprint(userId, sprintData);
        // Update with server-assigned ID if different
        if (saved.id !== optimisticSprint.id) {
          updateSprint(optimisticSprint.id, { ...saved });
          setActiveSprint(saved);
        }
        return saved;
      } catch (err) {
        // Rollback not needed — sprint is still valid locally
        // but log the sync failure
        setError('Sprint saved locally but failed to sync. It will sync when you reconnect.');
        return optimisticSprint;
      }
    },
    [session, todayStr, addSprint, setActiveSprint, updateSprint, setError, data]
  );

  const completeSprint = useCallback(
    async (
      sprintId: string,
      reflection: {
        focusQuality: number;
        intentionMet: 'yes' | 'partially' | 'no';
        note: string;
        interruptions: number;
        interruptionTypes: string[];
      }
    ) => {
      const updates: Partial<Sprint> = {
        phase: 'reflection' as SprintPhase,
        completed: true,
        ended_at: new Date().toISOString(),
        focus_quality: reflection.focusQuality,
        intention_met: reflection.intentionMet,
        reflection_note: reflection.note || null,
        interruptions: reflection.interruptions,
        interruption_types: reflection.interruptionTypes,
      };

      // Save previous state for rollback
      const previousSprint = sprints.find((s) => s.id === sprintId);

      // Optimistic update
      updateSprint(sprintId, updates);
      setActiveSprint(null);

      // Sync to backend
      try {
        await data.updateSprint(sprintId, updates);
      } catch (err) {
        // Rollback on failure
        if (previousSprint) {
          updateSprint(sprintId, {
            phase: previousSprint.phase,
            completed: previousSprint.completed,
            ended_at: previousSprint.ended_at,
            focus_quality: previousSprint.focus_quality,
            intention_met: previousSprint.intention_met,
            reflection_note: previousSprint.reflection_note,
            interruptions: previousSprint.interruptions,
            interruption_types: previousSprint.interruption_types,
          });
          setActiveSprint(previousSprint);
        }
        setError('Sprint completion failed to sync. Change has been reverted.');
      }

      // Schedule streak reminder for tomorrow if streak is active
      const currentStreak = useAppStore.getState().sprints
        .filter((s) => s.completed)
        .map((s) => s.date);
      const uniqueDays = new Set(currentStreak).size;
      if (uniqueDays > 0) {
        scheduleStreakReminder('a focus sprint', uniqueDays).catch(console.warn);
      }
    },
    [sprints, updateSprint, setActiveSprint, setError, data]
  );

  const updatePhase = useCallback(
    (sprintId: string, phase: SprintPhase) => {
      updateSprint(sprintId, { phase });
      // Update activeSprint based on current store state to avoid stale closures
      const current = useAppStore.getState().activeSprint;
      if (current?.id === sprintId) {
        setActiveSprint({ ...current, phase });
      }
    },
    [updateSprint, setActiveSprint]
  );

  return {
    sprints,
    todaySprints,
    completedToday,
    sprintStreak,
    activeSprint,
    startSprint,
    completeSprint,
    updatePhase,
    setActiveSprint,
  };
}
