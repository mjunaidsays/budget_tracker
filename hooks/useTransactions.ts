'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Transaction, TransactionFilters, TransactionType, Category } from '@/lib/types';
import {
  getMonthlyStats,
  getTotalBalance,
  getCategoryBreakdown,
  getMonthlyHistory,
  getDailySpending,
  getTopCategory,
  getAverageDailySpend,
} from '@/lib/calculations';

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id:          row.id as string,
    type:        row.type as TransactionType,
    category:    row.category as Category,
    amount:      Number(row.amount),
    description: row.description as string,
    date:        row.date as string,
    createdAt:   row.created_at as string,
    fundedBySavings: Boolean(row.funded_by_savings),
  };
}

const TX_CHANGED = 'fintracker:transactions-changed';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setTransactions((data ?? []).map(toTransaction));
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Re-fetch whenever any hook instance mutates data (e.g. AppShell adds, page list updates)
  useEffect(() => {
    const handler = () => fetchTransactions();
    window.addEventListener(TX_CHANGED, handler);
    return () => window.removeEventListener(TX_CHANGED, handler);
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      const tx: Transaction = {
        ...data,
        id:        crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      // Optimistic update
      setTransactions(prev => [tx, ...prev]);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('transactions').insert({
        user_id:     user.id,
        type:        tx.type,
        category:    tx.category,
        amount:      tx.amount,
        description: tx.description,
        date:        tx.date,
        funded_by_savings: tx.fundedBySavings ?? false,
      });
      window.dispatchEvent(new CustomEvent(TX_CHANGED));
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));

      const supabase = createClient();
      const dbData: Record<string, unknown> = {};
      if (data.type        !== undefined) dbData.type        = data.type;
      if (data.category    !== undefined) dbData.category    = data.category;
      if (data.amount      !== undefined) dbData.amount      = data.amount;
      if (data.description !== undefined) dbData.description = data.description;
      if (data.date        !== undefined) dbData.date        = data.date;
      if (data.fundedBySavings !== undefined) dbData.funded_by_savings = data.fundedBySavings;

      await supabase.from('transactions').update(dbData).eq('id', id);
      window.dispatchEvent(new CustomEvent(TX_CHANGED));
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
      const supabase = createClient();
      await supabase.from('transactions').delete().eq('id', id);
      window.dispatchEvent(new CustomEvent(TX_CHANGED));
    },
    []
  );

  const getFiltered = useCallback(
    (filters: TransactionFilters): Transaction[] => {
      return transactions
        .filter(t => {
          if (filters.month && !t.date.startsWith(filters.month)) return false;
          if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
          if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
          if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!t.description.toLowerCase().includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    [transactions]
  );

  const clearAll = useCallback(async () => {
    setTransactions([]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('transactions').delete().eq('user_id', user.id);
    window.dispatchEvent(new CustomEvent(TX_CHANGED));
  }, []);

  const seedData = useCallback(async () => {
    const { generateSeedTransactions } = await import('@/lib/seedData');
    const seeds = generateSeedTransactions();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = seeds.map(t => ({
      user_id:     user.id,
      type:        t.type,
      category:    t.category,
      amount:      t.amount,
      description: t.description,
      date:        t.date,
      created_at:  t.createdAt,
    }));

    await supabase.from('transactions').insert(rows);
    window.dispatchEvent(new CustomEvent(TX_CHANGED));
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFiltered,
    clearAll,
    seedData,
    getMonthlyStats:      (month: string) => getMonthlyStats(transactions, month),
    getTotalBalance:      ()              => getTotalBalance(transactions),
    getCategoryBreakdown: (month: string, type: 'income' | 'expense') => getCategoryBreakdown(transactions, month, type),
    getMonthlyHistory:    (n: number)     => getMonthlyHistory(transactions, n),
    getDailySpending:     (month: string) => getDailySpending(transactions, month),
    getTopCategory:       (month: string) => getTopCategory(transactions, month),
    getAvgDailySpend:     (month: string) => getAverageDailySpend(transactions, month),
  };
}
