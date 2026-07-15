import { format, parseISO, getDaysInMonth } from 'date-fns';
import { Transaction, Budget, MonthlySummary, CategorySummary, BudgetWithUsage, DailySpending, TransactionType, SavingsGoal, SafeToSpend, BudgetWarning, SavingsSummary } from './types';
import { getCategoryDef } from './categories';
import { getPastMonths, formatMonthShort } from './utils';

export function getMonthlyStats(transactions: Transaction[], month: string) {
  const monthly = transactions.filter(t => t.date.startsWith(month));
  const income   = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;
  return { income, expenses, savingsRate };
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  month: string,
  type: TransactionType
): CategorySummary[] {
  const monthly = transactions.filter(t => t.date.startsWith(month) && t.type === type);
  const total   = monthly.reduce((s, t) => s + t.amount, 0);

  const grouped: Record<string, number> = {};
  for (const t of monthly) {
    grouped[t.category] = (grouped[t.category] ?? 0) + t.amount;
  }

  return Object.entries(grouped)
    .map(([cat, amount]) => {
      const def = getCategoryDef(cat as never);
      return {
        category: cat as never,
        label: def.label,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: def.color,
        icon: def.icon,
        bgColor: def.bgColor,
      } as CategorySummary;
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyHistory(transactions: Transaction[], monthCount = 6): MonthlySummary[] {
  return getPastMonths(monthCount).map(month => {
    const { income, expenses, savingsRate } = getMonthlyStats(transactions, month);
    return { month, label: formatMonthShort(month), income, expenses, savingsRate };
  });
}

export function getBudgetUsage(budget: Budget, transactions: Transaction[]): BudgetWithUsage {
  const spent = transactions
    .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month))
    .reduce((s, t) => s + t.amount, 0);
  const remaining       = budget.limit - spent;
  const percentageUsed  = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
  const def             = getCategoryDef(budget.category);
  return {
    ...budget,
    spent,
    remaining,
    percentageUsed,
    isOverBudget: spent > budget.limit,
    label: def.label,
    color: def.color,
    icon: def.icon,
    bgColor: def.bgColor,
  };
}

export function getDailySpending(transactions: Transaction[], month: string): DailySpending[] {
  const daysCount = getDaysInMonth(parseISO(month + '-01'));
  const result: DailySpending[] = [];
  let cumulative = 0;
  for (let d = 1; d <= daysCount; d++) {
    const day = `${month}-${String(d).padStart(2, '0')}`;
    const amount = transactions
      .filter(t => t.type === 'expense' && t.date === day)
      .reduce((s, t) => s + t.amount, 0);
    cumulative += amount;
    result.push({ day: String(d), amount, cumulative });
  }
  return result;
}

export function getTopCategory(transactions: Transaction[], month: string): CategorySummary | null {
  const breakdown = getCategoryBreakdown(transactions, month, 'expense');
  return breakdown[0] ?? null;
}

export function getAverageDailySpend(transactions: Transaction[], month: string): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  const daysElapsed = today.startsWith(month)
    ? parseInt(today.split('-')[2], 10)
    : getDaysInMonth(parseISO(month + '-01'));
  const { expenses } = getMonthlyStats(transactions, month);
  return daysElapsed > 0 ? expenses / daysElapsed : 0;
}

/**
 * Expenses NOT paid out of savings — i.e. money that actually left this
 * month's income. Purchases marked `fundedBySavings` still show up everywhere
 * else (category totals, budgets, history) for a full "every penny" record,
 * but they draw down accumulated savings instead of this month's cash.
 */
export function getNonSavingsExpenses(transactions: Transaction[], month: string): number {
  return transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month) && !t.fundedBySavings)
    .reduce((s, t) => s + t.amount, 0);
}

/**
 * Two complementary "how much can I spend" numbers:
 * - plannedRemaining: income minus the FULL allocated budget (not what's spent yet)
 *   minus the savings target — stable across the month, reinforces the budget plan.
 * - cashRemaining: income minus ACTUAL spend so far (excluding anything paid from
 *   savings) minus the savings target — what's physically left right now.
 */
export function getSafeToSpend(
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoal: SavingsGoal | undefined,
  month: string
): SafeToSpend {
  const { income } = getMonthlyStats(transactions, month);
  const nonSavingsExpenses = getNonSavingsExpenses(transactions, month);
  const monthBudgets = budgets.filter(b => b.month === month);
  const totalBudgeted = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const savingsTarget = savingsGoal?.target ?? 0;

  return {
    plannedRemaining: income - totalBudgeted - savingsTarget,
    cashRemaining: income - nonSavingsExpenses - savingsTarget,
    hasBudgets: monthBudgets.length > 0,
    hasSavingsGoal: !!savingsGoal,
    savingsTarget,
  };
}

/**
 * How much a given month actually contributed to savings: whichever is larger
 * of an explicitly-logged "already set aside" amount, or the implied leftover
 * (income minus non-savings expenses) for that month.
 */
export function getMonthlySavedAmount(transactions: Transaction[], goal: SavingsGoal, month: string): number {
  const { income } = getMonthlyStats(transactions, month);
  const nonSavingsExpenses = getNonSavingsExpenses(transactions, month);
  return Math.max(goal.savedAside, income - nonSavingsExpenses);
}

/**
 * Running lifetime savings total: every month that has a savings goal
 * contributes its saved amount, and every savings-funded purchase (any month,
 * any category) draws the running total back down. No AI — plain arithmetic
 * over the user's own transaction/goal history.
 */
export function getTotalSavings(transactions: Transaction[], savingsGoals: SavingsGoal[]): SavingsSummary {
  const totalContributed = savingsGoals.reduce(
    (sum, goal) => sum + getMonthlySavedAmount(transactions, goal, goal.month),
    0
  );
  const totalWithdrawn = transactions
    .filter(t => t.type === 'expense' && t.fundedBySavings)
    .reduce((s, t) => s + t.amount, 0);

  return {
    totalSaved: totalContributed - totalWithdrawn,
    totalContributed,
    totalWithdrawn,
  };
}

/** Budgets at or above 80% usage, ranked worst-first — feeds insight cards + toast warnings. */
export function getBudgetWarnings(budgetsWithUsage: BudgetWithUsage[]): BudgetWarning[] {
  return budgetsWithUsage
    .filter(b => b.percentageUsed >= 80)
    .map((b): BudgetWarning => ({
      category: b.category as string,
      label: b.label,
      level: b.isOverBudget ? 'critical' : 'warning',
      percentageUsed: b.percentageUsed,
    }))
    .sort((a, b) => b.percentageUsed - a.percentageUsed);
}
