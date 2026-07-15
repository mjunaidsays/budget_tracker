import { Transaction, Budget, SavingsGoal } from './types';
import { subDays, format, parseISO } from 'date-fns';

/**
 * Walks backward day-by-day from `todayStr`. A day counts toward the streak if,
 * for every category with an active budget that month, cumulative spend-to-date
 * (from the start of that month through that day) stayed at or under the budget
 * limit. Stops at the first day that breaks the rule, or the first day with no
 * budget data at all for its month (no guessing into unbudgeted months).
 * Purely derived from existing transactions/budgets — no new source-of-truth flag.
 */
export function computeStreak(
  transactions: Transaction[],
  budgets: Budget[],
  todayStr: string,
  maxLookbackDays = 90
): { currentStreakDays: number } {
  let streak = 0;
  let cursor = parseISO(todayStr);

  for (let i = 0; i < maxLookbackDays; i++) {
    const dayStr = format(cursor, 'yyyy-MM-dd');
    const month = dayStr.slice(0, 7);
    const monthBudgets = budgets.filter(b => b.month === month);

    if (monthBudgets.length === 0) break; // no budget data for this month — stop the walk

    const brokeABudget = monthBudgets.some(b => {
      const spentToDate = transactions
        .filter(t => t.type === 'expense' && t.category === b.category && t.date >= `${month}-01` && t.date <= dayStr)
        .reduce((s, t) => s + t.amount, 0);
      return spentToDate > b.limit;
    });

    if (brokeABudget) break;

    streak++;
    cursor = subDays(cursor, 1);
  }

  return { currentStreakDays: streak };
}

export type BadgeCheck = {
  id: string;
  earned: (ctx: {
    transactions: Transaction[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    streak: { currentStreakDays: number; longestStreakDays: number };
  }) => boolean;
};

const BADGE_CHECKS: BadgeCheck[] = [
  { id: 'first-budget', earned: ({ budgets }) => budgets.length > 0 },
  { id: 'first-savings-goal', earned: ({ savingsGoals }) => savingsGoals.length > 0 },
  { id: 'streak-7', earned: ({ streak }) => streak.currentStreakDays >= 7 },
  { id: 'streak-30', earned: ({ streak }) => streak.currentStreakDays >= 30 },
  {
    id: 'savings-target-hit',
    earned: ({ transactions, savingsGoals }) =>
      savingsGoals.some(g => {
        const monthIncome = transactions
          .filter(t => t.type === 'income' && t.date.startsWith(g.month))
          .reduce((s, t) => s + t.amount, 0);
        const monthExpenses = transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(g.month))
          .reduce((s, t) => s + t.amount, 0);
        const actualSaved = Math.max(g.savedAside, monthIncome - monthExpenses);
        return g.target > 0 && actualSaved >= g.target;
      }),
  },
];

/**
 * Pure: takes current data + already-earned badge ids, returns only the
 * newly-qualifying badge ids for this evaluation. No AI — deterministic rules only.
 */
export function evaluateBadges(
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  streak: { currentStreakDays: number; longestStreakDays: number },
  alreadyEarned: string[]
): string[] {
  const earnedSet = new Set(alreadyEarned);
  const ctx = { transactions, budgets, savingsGoals, streak };
  return BADGE_CHECKS.filter(check => !earnedSet.has(check.id) && check.earned(ctx)).map(check => check.id);
}

export const BADGE_LABELS: Record<string, string> = {
  'first-budget': 'First Budget Set',
  'first-savings-goal': 'First Savings Goal',
  'streak-7': '7-Day Streak',
  'streak-30': '30-Day Streak',
  'savings-target-hit': 'Savings Target Hit',
};
