'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, PiggyBank, Pencil, PartyPopper, Wallet, ArrowDownCircle, ArrowRight } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { useTransactions } from '@/hooks/useTransactions';
import { SavingsGoalForm } from '@/components/savings/SavingsGoalForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { getCurrentMonth, formatMonth, formatDate, formatCurrency, cn } from '@/lib/utils';
import { getSavingsReminder, getBudgetWarningForTransaction, notifyBudgetWarning } from '@/lib/notifications';
import { getMonthlySavedAmount, getTotalSavings, getNonSavingsExpenses } from '@/lib/calculations';
import { useBudgets } from '@/hooks/useBudgets';
import { getCategoryDef } from '@/lib/categories';
import { Transaction } from '@/lib/types';

export default function SavingsPage() {
  const [month,    setMonth]    = useState(getCurrentMonth());
  const [formOpen, setFormOpen] = useState(false);
  const [spendOpen, setSpendOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const { savingsGoals, isLoading, setSavingsGoal, getSavingsGoalForMonth } = useSavings();
  const { transactions, isLoading: txLoading, getMonthlyStats, addTransaction } = useTransactions();
  const { budgets } = useBudgets();

  const goal = getSavingsGoalForMonth(month);
  const actualSaved = goal
    ? getMonthlySavedAmount(transactions, goal, month)
    : Math.max(0, getMonthlyStats(month).income - getNonSavingsExpenses(transactions, month));
  const target = goal?.target ?? 0;
  const percentageUsed = target > 0 ? Math.min((actualSaved / target) * 100, 100) : 0;
  const hitTarget = target > 0 && actualSaved >= target;
  const reminder = getSavingsReminder(goal, transactions, month);

  const { totalSaved, totalContributed, totalWithdrawn } = getTotalSavings(transactions, savingsGoals);
  const withdrawals = [...transactions]
    .filter(t => t.type === 'expense' && t.fundedBySavings)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const loading = isLoading || txLoading;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Showing savings for</h2>
          <p className="text-base font-semibold">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-[160px]" />
          <Button
            onClick={() => setFormOpen(true)}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
          >
            {goal ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {goal ? 'Edit Target' : 'Set Target'}
          </Button>
        </div>
      </div>

      {/* Cumulative total, across every month that has ever had a savings goal */}
      <Card className="overflow-hidden border-violet-200/60 dark:border-violet-800/40">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Saved</p>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  <AnimatedNumber value={totalSaved} />
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Every month&apos;s contribution added together, minus anything spent from savings
              </p>
            </div>
            <div className="flex sm:flex-col gap-4 sm:gap-1.5 sm:text-right shrink-0">
              <div>
                <p className="text-xs text-muted-foreground">Contributed</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalContributed)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent from savings</p>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(totalWithdrawn)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Need to dip into savings for something?
            </p>
            <Button
              onClick={() => setSpendOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" /> Spend from Savings
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ) : !goal ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
          <PiggyBank className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No savings target set</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Set a monthly savings target and we&apos;ll track your progress and nudge you along the way.
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Set Your First Target
          </Button>
        </div>
      ) : (
        <Card className={cn(hitTarget && 'border-emerald-300/60 dark:border-emerald-800/50')}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  hitTarget ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-violet-100 dark:bg-violet-900/30'
                )}>
                  {hitTarget
                    ? <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : <PiggyBank className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Monthly Savings Goal</p>
                  <p className="text-xs text-muted-foreground">{formatMonth(month)}</p>
                </div>
              </div>
              <span className={cn('text-xs font-semibold', hitTarget ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground')}>
                {percentageUsed.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Saved</span>
                <span className="font-medium">
                  {formatCurrency(actualSaved)} / {formatCurrency(target)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', hitTarget ? 'bg-emerald-500' : 'bg-violet-500')}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${percentageUsed}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {hitTarget ? (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Great job — you&apos;ve hit this month&apos;s savings goal!
              </p>
            ) : reminder ? (
              <p className="text-xs text-muted-foreground">{reminder}</p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Full audit trail of every purchase paid from savings — nothing hidden. */}
      {!loading && withdrawals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Spent from Savings</p>
              <Link href="/transactions" className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-0.5">
              {withdrawals.slice(0, 6).map(t => {
                const def = getCategoryDef(t.category);
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', def.bgColor)}>
                      <ArrowDownCircle className="w-4 h-4" style={{ color: def.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{def.label} · {formatDate(t.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-rose-500 shrink-0">-{formatCurrency(t.amount)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <SavingsGoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        month={month}
        existingGoal={goal}
        onSubmit={(t, s) => { setSavingsGoal(month, t, s); setFormOpen(false); }}
      />

      <TransactionForm
        open={spendOpen}
        onOpenChange={setSpendOpen}
        mode="add"
        initialFundedBySavings
        onSubmit={data => {
          addTransaction(data);
          notifyBudgetWarning(
            getBudgetWarningForTransaction(data, budgets, [...transactions, data as Transaction])
          );
          setSpendOpen(false);
        }}
      />
    </div>
  );
}
