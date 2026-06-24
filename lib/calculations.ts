import { format, parseISO, getDaysInMonth } from 'date-fns';
import { Transaction, Budget, MonthlySummary, CategorySummary, BudgetWithUsage, DailySpending, TransactionType } from './types';
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
