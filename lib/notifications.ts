import { toast } from 'sonner';
import { Budget, Transaction, SavingsGoal, BudgetWarning } from './types';
import { getBudgetUsage } from './calculations';

/**
 * Checks whether adding/editing an expense transaction pushed its category's
 * budget (if one exists for that month) at/over the warning threshold.
 * Pure — the caller decides how/whether to render a toast from the result.
 */
export function getBudgetWarningForTransaction(
  tx: Pick<Transaction, 'type' | 'category' | 'date'>,
  budgets: Budget[],
  transactions: Transaction[]
): BudgetWarning | null {
  if (tx.type !== 'expense') return null;
  const month = tx.date.slice(0, 7);
  const budget = budgets.find(b => b.month === month && b.category === tx.category);
  if (!budget) return null;

  const usage = getBudgetUsage(budget, transactions);
  if (usage.percentageUsed < 80) return null;

  return {
    category: usage.category as string,
    label: usage.label,
    level: usage.isOverBudget ? 'critical' : 'warning',
    percentageUsed: usage.percentageUsed,
  };
}

/**
 * A gentle, deterministic nudge when a savings target is set but the user
 * hasn't set anything aside yet this month (income currently below expenses,
 * or below the target's pace). Returns null when there's nothing to say.
 */
export function getSavingsReminder(savingsGoal: SavingsGoal | undefined, transactions: Transaction[], month: string): string | null {
  if (!savingsGoal || savingsGoal.target <= 0) return null;

  const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  const actualSaved = Math.max(savingsGoal.savedAside, income - expenses);

  if (actualSaved >= savingsGoal.target) return null;
  if (actualSaved <= 0) {
    return `You haven't set anything aside toward your $${savingsGoal.target.toLocaleString()} savings goal this month yet.`;
  }
  const remaining = savingsGoal.target - actualSaved;
  return `You're $${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} away from this month's savings goal.`;
}

/** Fires a warning/critical toast for a budget threshold crossing. No-op when `warning` is null. */
export function notifyBudgetWarning(warning: BudgetWarning | null) {
  if (!warning) return;
  const pct = Math.round(warning.percentageUsed);
  if (warning.level === 'critical') {
    toast.error(`${warning.label} budget exceeded`, {
      description: `You've spent ${pct}% of your ${warning.label} budget this month.`,
    });
  } else {
    toast.warning(`Close to your ${warning.label} budget`, {
      description: `You've used ${pct}% of your ${warning.label} budget this month.`,
    });
  }
}
