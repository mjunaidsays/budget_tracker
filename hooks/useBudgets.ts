'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Budget, BudgetWithUsage, ExpenseCategory, Transaction } from '@/lib/types';
import { getBudgetUsage } from '@/lib/calculations';

function toBudget(row: Record<string, unknown>): Budget {
  return {
    id:       row.id as string,
    category: row.category as ExpenseCategory,
    limit:    Number(row.limit),
    month:    row.month as string,
  };
}

export function useBudgets() {
  const [budgets,   setBudgetsState] = useState<Budget[]>([]);
  const [isLoading, setIsLoading]    = useState(true);

  const fetchBudgets = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('budgets').select('*');
    setBudgetsState((data ?? []).map(toBudget));
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const setBudget = useCallback(
    async (category: ExpenseCategory, limit: number, month: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('budgets').upsert(
        { user_id: user.id, category, limit, month },
        { onConflict: 'user_id,category,month' }
      );
      await fetchBudgets();
    },
    [fetchBudgets]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      setBudgetsState(prev => prev.filter(b => b.id !== id));
      const supabase = createClient();
      await supabase.from('budgets').delete().eq('id', id);
    },
    []
  );

  const getBudgetsWithUsage = useCallback(
    (month: string, transactions: Transaction[]): BudgetWithUsage[] => {
      return budgets
        .filter(b => b.month === month)
        .map(b => getBudgetUsage(b, transactions))
        .sort((a, b) => b.percentageUsed - a.percentageUsed);
    },
    [budgets]
  );

  const clearAll = useCallback(async () => {
    setBudgetsState([]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('budgets').delete().eq('user_id', user.id);
  }, []);

  const seedBudgets = useCallback(async () => {
    const { generateSeedBudgets } = await import('@/lib/seedData');
    const seeds = generateSeedBudgets();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = seeds.map(b => ({
      user_id:  user.id,
      category: b.category,
      limit:    b.limit,
      month:    b.month,
    }));

    await supabase.from('budgets').upsert(rows, { onConflict: 'user_id,category,month' });
    await fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    isLoading,
    setBudget,
    deleteBudget,
    getBudgetsWithUsage,
    clearAll,
    seedBudgets,
  };
}
