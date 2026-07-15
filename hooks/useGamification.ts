'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Transaction, Budget, SavingsGoal, GamificationState, BadgeEarned } from '@/lib/types';
import { computeStreak, evaluateBadges } from '@/lib/gamification';
import { today } from '@/lib/utils';

function toState(row: Record<string, unknown> | null): GamificationState {
  if (!row) return { currentStreakDays: 0, longestStreakDays: 0, lastEvaluatedDate: null };
  return {
    currentStreakDays: Number(row.current_streak_days),
    longestStreakDays: Number(row.longest_streak_days),
    lastEvaluatedDate: (row.last_evaluated_date as string) ?? null,
  };
}

function toBadge(row: Record<string, unknown>): BadgeEarned {
  return {
    id:       row.id as string,
    badgeId:  row.badge_id as string,
    earnedAt: row.earned_at as string,
    meta:     (row.meta as Record<string, unknown>) ?? undefined,
  };
}

export function useGamification() {
  const [state,     setState]     = useState<GamificationState>({ currentStreakDays: 0, longestStreakDays: 0, lastEvaluatedDate: null });
  const [badges,    setBadges]    = useState<BadgeEarned[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchState = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('gamification_state').select('*').maybeSingle();
    setState(toState(data));
  }, []);

  const fetchBadges = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('badges_earned').select('*');
    setBadges((data ?? []).map(toBadge));
  }, []);

  useEffect(() => {
    Promise.all([fetchState(), fetchBadges()]).finally(() => setIsLoading(false));
  }, [fetchState, fetchBadges]);

  /**
   * Recomputes streak + newly-earned badges from real transaction/budget/savings
   * history (no AI — deterministic rules in lib/gamification.ts). Cheap to call
   * on every dashboard mount since it's gated to run at most once per day.
   */
  const evaluate = useCallback(
    async (transactions: Transaction[], budgets: Budget[], savingsGoals: SavingsGoal[]) => {
      const todayStr = today();
      if (state.lastEvaluatedDate === todayStr) {
        return { newBadgeIds: [] as string[], streak: state };
      }

      const { currentStreakDays } = computeStreak(transactions, budgets, todayStr);
      const longestStreakDays = Math.max(currentStreakDays, state.longestStreakDays);
      const newStreak = { currentStreakDays, longestStreakDays, lastEvaluatedDate: todayStr };

      const newBadgeIds = evaluateBadges(
        transactions,
        budgets,
        savingsGoals,
        { currentStreakDays, longestStreakDays },
        badges.map(b => b.badgeId)
      );

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { newBadgeIds: [], streak: state };

      await supabase.from('gamification_state').upsert(
        {
          user_id: user.id,
          current_streak_days: currentStreakDays,
          longest_streak_days: longestStreakDays,
          last_evaluated_date: todayStr,
        },
        { onConflict: 'user_id' }
      );

      if (newBadgeIds.length > 0) {
        await supabase.from('badges_earned').insert(
          newBadgeIds.map(badgeId => ({ user_id: user.id, badge_id: badgeId }))
        );
      }

      setState(newStreak);
      await fetchBadges();

      return { newBadgeIds, streak: newStreak };
    },
    [state, badges, fetchBadges]
  );

  return { state, badges, isLoading, fetchState, fetchBadges, evaluate };
}
