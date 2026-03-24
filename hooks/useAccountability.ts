import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { AccountabilityPartner, StreakChallenge } from '@/types';

/**
 * Hook for managing accountability partners and streak challenges.
 * In demo mode, provides mock data. In real mode, uses Supabase.
 */
export function useAccountability() {
  const session = useAppStore((s) => s.session);
  const [partner, setPartner] = useState<AccountabilityPartner | null>(null);
  const [challenges, setChallenges] = useState<StreakChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPartner = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      // TODO: fetch from Supabase when connected
      // For demo, use mock data if DEMO_MODE
      const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true'
        || process.env.EXPO_PUBLIC_SUPABASE_URL === undefined
        || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

      if (isDemoMode) {
        setPartner({
          id: 'ap-demo-1',
          user_id: 'demo-user-001',
          partner_id: 'demo-user-002',
          partner_name: 'Jordan',
          status: 'active',
          created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        });
        setChallenges([{
          id: 'sc-demo-1',
          partnership_id: 'ap-demo-1',
          habit_title: 'Morning Meditation',
          target_days: 7,
          user_progress: 5,
          partner_progress: 4,
          started_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          completed_at: null,
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const invitePartner = useCallback(async (partnerEmail: string) => {
    if (!session?.user?.id) return;
    // TODO: implement with Supabase — lookup user by email, create partnership
    console.log('Invite partner:', partnerEmail);
  }, [session?.user?.id]);

  const createChallenge = useCallback(async (habitTitle: string, targetDays: number) => {
    if (!partner) return;
    const newChallenge: StreakChallenge = {
      id: `sc-${Date.now()}`,
      partnership_id: partner.id,
      habit_title: habitTitle,
      target_days: targetDays,
      user_progress: 0,
      partner_progress: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
    };
    setChallenges((prev) => [newChallenge, ...prev]);
  }, [partner]);

  return { partner, challenges, loading, fetchPartner, invitePartner, createChallenge };
}
