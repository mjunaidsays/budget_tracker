import { subMonths, parseISO, format } from 'date-fns';
import { Transaction, Budget, SavingsGoal, HealthScore, HealthScoreComponent } from './types';
import { getBudgetUsage, getMonthlyStats, getMonthlySavedAmount } from './calculations';

/** Months strictly before `month`, most-recent-first — independent of "today," unlike getMonthlyHistory. */
function getPriorMonths(month: string, count: number): string[] {
  const base = parseISO(month + '-01');
  return Array.from({ length: count }, (_, i) => format(subMonths(base, i + 1), 'yyyy-MM'));
}

function scoreBudgetAdherence(transactions: Transaction[], budgets: Budget[], month: string): HealthScoreComponent {
  const monthBudgets = budgets.filter(b => b.month === month);
  if (monthBudgets.length === 0) {
    return { key: 'budgetAdherence', label: 'Budget adherence', earnedPoints: 0, maxPoints: 0, reason: 'No budgets set this month' };
  }

  const usages = monthBudgets.map(b => getBudgetUsage(b, transactions));
  const overBudget = usages.filter(u => u.isOverBudget).sort((a, b) => b.percentageUsed - a.percentageUsed);
  const withinCount = usages.length - overBudget.length;
  const earnedPoints = 25 * (withinCount / usages.length);

  const worst = overBudget[0];
  const reason = worst
    ? `${worst.label} exceeded its budget by ${Math.round(worst.percentageUsed - 100)}%${overBudget.length > 1 ? ` (and ${overBudget.length - 1} other categor${overBudget.length - 1 === 1 ? 'y' : 'ies'})` : ''}`
    : undefined;

  return { key: 'budgetAdherence', label: 'Budget adherence', earnedPoints, maxPoints: 25, reason };
}

function scoreSavingsAchievement(transactions: Transaction[], savingsGoals: SavingsGoal[], month: string): HealthScoreComponent {
  const goal = savingsGoals.find(g => g.month === month);
  if (!goal || goal.target <= 0) {
    return { key: 'savingsAchievement', label: 'Savings goal', earnedPoints: 0, maxPoints: 0, reason: 'No savings target set this month' };
  }

  const actualSaved = getMonthlySavedAmount(transactions, goal, month);
  const ratio = Math.min(actualSaved / goal.target, 1);
  const earnedPoints = 25 * ratio;
  const reason = ratio < 1 ? `You saved ${Math.round(ratio * 100)}% of your $${goal.target.toLocaleString()} target` : undefined;

  return { key: 'savingsAchievement', label: 'Savings goal', earnedPoints, maxPoints: 25, reason };
}

/** 20% savings rate is treated as "full marks" — a commonly cited healthy-savings-rate benchmark. */
const SAVINGS_RATE_BENCHMARK = 20;

function scoreSavingsRate(transactions: Transaction[], month: string): HealthScoreComponent {
  const { savingsRate } = getMonthlyStats(transactions, month);
  const earnedPoints = 25 * Math.min(savingsRate / SAVINGS_RATE_BENCHMARK, 1);
  const reason = earnedPoints < 25 ? `Your savings rate this month was ${savingsRate.toFixed(0)}%, below the ${SAVINGS_RATE_BENCHMARK}% target` : undefined;

  return { key: 'savingsRate', label: 'Savings rate', earnedPoints, maxPoints: 25, reason };
}

/** Within ±15% of the trailing-3-month average expense = full marks, scaling down to 0 at ±60% deviation. */
const CONSISTENCY_TOLERANT_BAND = 0.15;
const CONSISTENCY_FLOOR_BAND = 0.6;

function scoreSpendingConsistency(transactions: Transaction[], month: string): HealthScoreComponent {
  const priorMonths = getPriorMonths(month, 3)
    .map(m => getMonthlyStats(transactions, m).expenses)
    .filter(expenses => expenses > 0);

  if (priorMonths.length === 0) {
    return { key: 'spendingConsistency', label: 'Spending consistency', earnedPoints: 0, maxPoints: 0, reason: 'Not enough history yet to compare' };
  }

  const avgPrior = priorMonths.reduce((s, n) => s + n, 0) / priorMonths.length;
  const { expenses: currentExpenses } = getMonthlyStats(transactions, month);
  const deviation = Math.abs(currentExpenses - avgPrior) / avgPrior;

  let earnedPoints: number;
  if (deviation <= CONSISTENCY_TOLERANT_BAND) {
    earnedPoints = 25;
  } else if (deviation >= CONSISTENCY_FLOOR_BAND) {
    earnedPoints = 0;
  } else {
    earnedPoints = 25 * (1 - (deviation - CONSISTENCY_TOLERANT_BAND) / (CONSISTENCY_FLOOR_BAND - CONSISTENCY_TOLERANT_BAND));
  }

  const reason = earnedPoints < 25 ? `Your spending this month was ${Math.round(deviation * 100)}% different from your recent average` : undefined;

  return { key: 'spendingConsistency', label: 'Spending consistency', earnedPoints, maxPoints: 25, reason };
}

export function getHealthScoreGrade(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 50) return 'Good';
  return 'Needs Improvement';
}

/**
 * Rule-based, fully local 0-100 financial health score — no AI. Composes only
 * existing calculation functions. Components with nothing to score (no budgets,
 * no savings goal, no prior-month history) contribute 0/0 and are automatically
 * excluded from the final ratio, so missing data never drags the score down
 * unfairly.
 */
export function getHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  month: string,
  streak: { currentStreakDays: number }
): HealthScore {
  const hasTransactionsThisMonth = transactions.some(t => t.date.startsWith(month));
  if (!hasTransactionsThisMonth) {
    return { score: null, grade: null, breakdown: [], reasons: [], hasEnoughData: false };
  }

  const breakdown: HealthScoreComponent[] = [
    scoreBudgetAdherence(transactions, budgets, month),
    scoreSavingsAchievement(transactions, savingsGoals, month),
    scoreSavingsRate(transactions, month),
    scoreSpendingConsistency(transactions, month),
  ];

  const earnedSum = breakdown.reduce((s, c) => s + c.earnedPoints, 0);
  const maxPointsSum = breakdown.reduce((s, c) => s + c.maxPoints, 0);

  if (maxPointsSum === 0) {
    return { score: null, grade: null, breakdown, reasons: [], hasEnoughData: false };
  }

  const score = Math.round((100 * earnedSum) / maxPointsSum);
  const reasons = breakdown.map(c => c.reason).filter((r): r is string => !!r);

  if (streak.currentStreakDays >= 7) {
    reasons.unshift(`${streak.currentStreakDays}-day under-budget streak going strong`);
  }

  return { score, grade: getHealthScoreGrade(score), breakdown, reasons, hasEnoughData: true };
}
