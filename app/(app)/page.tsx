'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { getCurrentMonth } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2 } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { DeleteConfirmDialog } from '@/components/transactions/DeleteConfirmDialog';

const MonthlyBarChart    = dynamic(() => import('@/components/dashboard/MonthlyBarChart').then(m => ({ default: m.MonthlyBarChart })), { ssr: false });
const CategoryDonutChart = dynamic(() => import('@/components/dashboard/CategoryDonutChart').then(m => ({ default: m.CategoryDonutChart })), { ssr: false });

export default function DashboardPage() {
  const {
    transactions,
    isLoading,
    getMonthlyStats,
    getTotalBalance,
    getCategoryBreakdown,
    getMonthlyHistory,
    clearAll: clearTransactions,
    seedData,
  } = useTransactions();
  const { clearAll: clearBudgets, seedBudgets } = useBudgets();

  const [resetOpen, setResetOpen] = useState(false);

  const currentMonth = getCurrentMonth();
  const stats        = getMonthlyStats(currentMonth);
  const categoryData = getCategoryBreakdown(currentMonth, 'expense');
  const historyData  = getMonthlyHistory(6);
  const totalBalance = getTotalBalance();

  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

  async function handleSeedData() {
    await seedData();
    await seedBudgets();
  }

  async function handleReset() {
    await clearTransactions();
    await clearBudgets();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SummaryCards
        totalBalance={totalBalance}
        monthlyIncome={stats.income}
        monthlyExpenses={stats.expenses}
        savingsRate={stats.savingsRate}
        isLoading={isLoading}
      />

      {!isLoading && transactions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">Welcome to FinTracker!</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Start by adding your first transaction, or load sample data to explore the app.
          </p>
          <Button
            onClick={handleSeedData}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Load Sample Data
          </Button>
        </div>
      )}

      {(isLoading || transactions.length > 0) && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MonthlyBarChart data={historyData} />
            </div>
            <div className="lg:col-span-1">
              <CategoryDonutChart data={categoryData} total={stats.expenses} />
            </div>
          </div>

          <RecentTransactions transactions={sorted} isLoading={isLoading} />

          {!isLoading && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetOpen(true)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset all data
              </Button>
            </div>
          )}
        </>
      )}

      <DeleteConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset All Data"
        description="This will permanently delete all transactions and budgets. This cannot be undone."
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
      />
    </div>
  );
}
