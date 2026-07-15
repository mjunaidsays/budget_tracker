import { Transaction, Budget, InsightCard } from './types';
import { getCategoryDef } from './categories';
import { getMonthlyStats, getBudgetUsage, getTopCategory } from './calculations';
import { today } from './utils';
import { subDays, format, parseISO } from 'date-fns';

function sumExpenses(transactions: Transaction[], fromDate: string, toDateExclusive: string, category?: string): number {
  return transactions
    .filter(t =>
      t.type === 'expense' &&
      t.date >= fromDate &&
      t.date < toDateExclusive &&
      (category === undefined || t.category === category)
    )
    .reduce((s, t) => s + t.amount, 0);
}

/** Category-level week-over-week spending spikes (guards divide-by-zero, ignores noise under $20). */
function spikeInsights(transactions: Transaction[]): InsightCard[] {
  const now = parseISO(today());
  const weekStart = format(subDays(now, 7), 'yyyy-MM-dd');
  const prevWeekStart = format(subDays(now, 14), 'yyyy-MM-dd');
  const todayStr = today();

  const categories = new Set(
    transactions.filter(t => t.type === 'expense' && t.date >= prevWeekStart && t.date < todayStr).map(t => t.category)
  );

  const cards: InsightCard[] = [];
  for (const category of Array.from(categories)) {
    const current = sumExpenses(transactions, weekStart, todayStr, category);
    const previous = sumExpenses(transactions, prevWeekStart, weekStart, category);
    if (previous <= 0 || current <= 20) continue;
    const pctChange = ((current - previous) / previous) * 100;
    if (pctChange >= 15) {
      const def = getCategoryDef(category);
      cards.push({
        id: `spike-${category}`,
        tone: 'warning',
        title: `${def.label} spending is up`,
        description: `You spent ${Math.round(pctChange)}% more on ${def.label} this week than last week.`,
        icon: def.icon,
      });
    }
  }
  return cards.slice(0, 2);
}

/** Budgets at 80%+ usage this month. */
function nearLimitInsights(transactions: Transaction[], budgets: Budget[], month: string): InsightCard[] {
  return budgets
    .filter(b => b.month === month)
    .map(b => getBudgetUsage(b, transactions))
    .filter(b => b.percentageUsed >= 80)
    .sort((a, b) => b.percentageUsed - a.percentageUsed)
    .slice(0, 2)
    .map(b => ({
      id: `near-limit-${b.category}`,
      tone: b.isOverBudget ? 'warning' : 'neutral',
      title: b.isOverBudget ? `${b.label} budget exceeded` : `You're close to your ${b.label} budget`,
      description: b.isOverBudget
        ? `You've spent ${formatPct(b.percentageUsed)} of your ${b.label} budget this month.`
        : `You've used ${formatPct(b.percentageUsed)} of your ${b.label} budget this month.`,
      icon: b.icon,
    }));
}

function formatPct(n: number): string {
  return `${Math.round(n)}%`;
}

/** This month vs. last month total expenses. */
function monthOverMonthInsight(transactions: Transaction[], month: string): InsightCard | null {
  const [y, m] = month.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1); // m is 1-indexed; month-2 -> previous month index
  const prevMonth = format(prevDate, 'yyyy-MM');

  const current = getMonthlyStats(transactions, month).expenses;
  const previous = getMonthlyStats(transactions, prevMonth).expenses;
  if (previous <= 0 || current <= 0) return null;

  const pctChange = ((current - previous) / previous) * 100;
  if (pctChange <= -10) {
    return {
      id: 'month-over-month-improvement',
      tone: 'positive',
      title: 'Great job!',
      description: `You spent ${Math.round(Math.abs(pctChange))}% less than last month.`,
      icon: 'TrendingDown',
    };
  }
  if (pctChange >= 20) {
    return {
      id: 'month-over-month-increase',
      tone: 'warning',
      title: 'Spending is trending up',
      description: `You've spent ${Math.round(pctChange)}% more than last month so far.`,
      icon: 'TrendingUp',
    };
  }
  return null;
}

/** One category dominating the month's spend. */
function concentrationInsight(transactions: Transaction[], month: string): InsightCard | null {
  const top = getTopCategory(transactions, month);
  if (!top || top.percentage < 40) return null;
  return {
    id: 'top-category-concentration',
    tone: 'neutral',
    title: `${top.label} is your biggest expense`,
    description: `${top.label} makes up ${Math.round(top.percentage)}% of your spending this month.`,
    icon: top.icon,
  };
}

/**
 * Rule-based, fully local insight generation — no AI/LLM calls. Every rule is a
 * small pure function over real transaction/budget history; returns [] gracefully
 * for new users with insufficient data.
 */
export function generateInsights(transactions: Transaction[], budgets: Budget[], month: string): InsightCard[] {
  const cards: InsightCard[] = [
    ...nearLimitInsights(transactions, budgets, month),
    ...spikeInsights(transactions),
  ];

  const momInsight = monthOverMonthInsight(transactions, month);
  if (momInsight) cards.push(momInsight);

  const concentration = concentrationInsight(transactions, month);
  if (concentration) cards.push(concentration);

  return cards;
}
