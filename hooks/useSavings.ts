'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SavingsGoal } from '@/lib/types';

function toSavingsGoal(row: Record<string, unknown>): SavingsGoal {
  return {
    id:         row.id as string,
    month:      row.month as string,
    target:     Number(row.target),
    savedAside: Number(row.saved_aside),
    createdAt:  row.created_at as string,
    updatedAt:  row.updated_at as string,
  };
}

const SAVINGS_CHANGED = 'fintracker:savings-changed';

export function useSavings() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  const fetchSavingsGoals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('savings_goals').select('*');
    setSavingsGoals((data ?? []).map(toSavingsGoal));
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSavingsGoals(); }, [fetchSavingsGoals]);

  // Re-fetch whenever any hook instance mutates data, mirrors useTransactions' TX_CHANGED pattern.
  useEffect(() => {
    const handler = () => fetchSavingsGoals();
    window.addEventListener(SAVINGS_CHANGED, handler);
    return () => window.removeEventListener(SAVINGS_CHANGED, handler);
  }, [fetchSavingsGoals]);

  const setSavingsGoal = useCallback(
    async (month: string, target: number, savedAside?: number) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload: Record<string, unknown> = { user_id: user.id, month, target };
      if (savedAside !== undefined) payload.saved_aside = savedAside;

      await supabase.from('savings_goals').upsert(payload, { onConflict: 'user_id,month' });
      window.dispatchEvent(new CustomEvent(SAVINGS_CHANGED));
    },
    []
  );

  const updateSavedAside = useCallback(
    async (month: string, savedAside: number) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('savings_goals')
        .update({ saved_aside: savedAside })
        .eq('user_id', user.id)
        .eq('month', month);
      window.dispatchEvent(new CustomEvent(SAVINGS_CHANGED));
    },
    []
  );

  const deleteSavingsGoal = useCallback(async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    const supabase = createClient();
    await supabase.from('savings_goals').delete().eq('id', id);
    window.dispatchEvent(new CustomEvent(SAVINGS_CHANGED));
  }, []);

  const getSavingsGoalForMonth = useCallback(
    (month: string): SavingsGoal | undefined => savingsGoals.find(g => g.month === month),
    [savingsGoals]
  );

  const clearAll = useCallback(async () => {
    setSavingsGoals([]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('savings_goals').delete().eq('user_id', user.id);
    window.dispatchEvent(new CustomEvent(SAVINGS_CHANGED));
  }, []);

  return {
    savingsGoals,
    isLoading,
    setSavingsGoal,
    updateSavedAside,
    deleteSavingsGoal,
    getSavingsGoalForMonth,
    fetchSavingsGoals,
    clearAll,
  };
}
