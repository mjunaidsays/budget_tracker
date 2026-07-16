import { subMonths, parseISO, format } from 'date-fns';
import { Transaction, BiggestImprovement } from './types';
import { getCategoryBreakdown } from './calculations';

/**
 * The expense category with the largest month-over-month percentage decrease
 * — a "biggest improvement" callout for monthly reports. Pure, no AI. Returns
 * a null-shaped result when there's no previous-month expense data to compare.
 */
export function getBiggestImprovement(transactions: Transaction[], month: string): BiggestImprovement {
  const prevMonth = format(subMonths(parseISO(month + '-01'), 1), 'yyyy-MM');
  const prevBreakdown = getCategoryBreakdown(transactions, prevMonth, 'expense');
  const currBreakdown = getCategoryBreakdown(transactions, month, 'expense');

  if (prevBreakdown.length === 0) {
    return { category: null, label: null, previousAmount: 0, currentAmount: 0, percentageDecrease: null };
  }

  let best: BiggestImprovement = { category: null, label: null, previousAmount: 0, currentAmount: 0, percentageDecrease: null };

  for (const prev of prevBreakdown) {
    if (prev.amount <= 0) continue;
    const curr = currBreakdown.find(c => c.category === prev.category);
    const currentAmount = curr?.amount ?? 0;
    const percentageDecrease = ((prev.amount - currentAmount) / prev.amount) * 100;

    if (best.percentageDecrease === null || percentageDecrease > best.percentageDecrease) {
      best = {
        category: prev.category as string,
        label: prev.label,
        previousAmount: prev.amount,
        currentAmount,
        percentageDecrease,
      };
    }
  }

  return best;
}
