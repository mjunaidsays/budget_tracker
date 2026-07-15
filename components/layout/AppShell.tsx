'use client';
import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { getBudgetWarningForTransaction, notifyBudgetWarning } from '@/lib/notifications';
import { Transaction } from '@/lib/types';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [formOpen, setFormOpen] = useState(false);
  const { transactions, addTransaction } = useTransactions();
  const { budgets } = useBudgets();

  return (
    // Respects the OS-level "reduce motion" setting app-wide for every framer-motion animation below.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Header onAddTransaction={() => setFormOpen(true)} />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>

        <TransactionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="add"
          onSubmit={data => {
            addTransaction(data);
            notifyBudgetWarning(
              getBudgetWarningForTransaction(data, budgets, [...transactions, data as Transaction])
            );
            setFormOpen(false);
          }}
        />
      </div>
    </MotionConfig>
  );
}
