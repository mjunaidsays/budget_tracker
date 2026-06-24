'use client';
import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentMonth, formatMonth } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { ExpenseCategory } from '@/lib/types';

export default function BudgetsPage() {
  const [month,    setMonth]    = useState(getCurrentMonth());
  const [formOpen, setFormOpen] = useState(false);

  const { isLoading, setBudget, deleteBudget, getBudgetsWithUsage } = useBudgets();
  const { transactions } = useTransactions();

  const budgetsWithUsage   = getBudgetsWithUsage(month, transactions);
  const usedCategories     = budgetsWithUsage.map(b => b.category as ExpenseCategory);
  const unusedCategories   = EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c.id as ExpenseCategory));

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Showing budgets for</h2>
          <p className="text-base font-semibold">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-[160px]" />
          <Button
            onClick={() => setFormOpen(true)}
            disabled={unusedCategories.length === 0}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" /> Set Budget
          </Button>
        </div>
      </div>

      {!isLoading && budgetsWithUsage.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
          <Target className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No budgets set</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Set monthly spending limits per category to stay on track.
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Set Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsWithUsage.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              onDelete={deleteBudget}
              onUpdate={setBudget}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        month={month}
        excludeCategories={usedCategories}
        onSubmit={(cat, lim) => { setBudget(cat, lim, month); setFormOpen(false); }}
      />
    </div>
  );
}
