'use client';
import { useState } from 'react';
import { addMonths, subMonths, parseISO, format } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, PiggyBank, Tag, TrendingDown as ImprovementIcon, CheckCircle2, XCircle, HeartPulse } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useSavings } from '@/hooks/useSavings';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { InsightCardsSection } from '@/components/dashboard/InsightCardsSection';
import { getCurrentMonth, formatMonth, formatCurrency, cn } from '@/lib/utils';
import { getMonthlyStats, getMonthlySavedAmount, getTopCategory } from '@/lib/calculations';
import { getBiggestImprovement } from '@/lib/monthlyReport';
import { getHealthScore } from '@/lib/healthScore';
import { generateInsights } from '@/lib/insights';

const GRADE_STYLES: Record<string, string> = {
  Excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Great: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Good: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Needs Improvement': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function ReportsPage() {
  const [month, setMonth] = useState(getCurrentMonth());

  const { transactions, isLoading: txLoading } = useTransactions();
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { savingsGoals, isLoading: savingsLoading, getSavingsGoalForMonth } = useSavings();
  const { state: gamificationState, isLoading: gamificationLoading } = useGamification();

  const isLoading = txLoading || budgetsLoading || savingsLoading || gamificationLoading;

  const stats = getMonthlyStats(transactions, month);
  const goal = getSavingsGoalForMonth(month);
  const savedThisMonth = goal ? getMonthlySavedAmount(transactions, goal, month) : 0;
  const topCategory = getTopCategory(transactions, month);
  const improvement = getBiggestImprovement(transactions, month);
  const healthScore = getHealthScore(transactions, budgets, savingsGoals, month, {
    currentStreakDays: gamificationState.currentStreakDays,
  });
  const insights = generateInsights(transactions, budgets, month);

  const goalStatus: 'achieved' | 'missed' | 'none' = !goal ? 'none' : savedThisMonth >= goal.target ? 'achieved' : 'missed';

  function shiftMonth(delta: number) {
    const base = parseISO(month + '-01');
    const next = delta > 0 ? addMonths(base, delta) : subMonths(base, -delta);
    setMonth(format(next, 'yyyy-MM'));
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm text-muted-foreground">Monthly report for</h2>
          <p className="font-semibold text-lg">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-[160px]" />
          <Button variant="outline" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Income', value: stats.income, icon: TrendingUp, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Spent', value: stats.expenses, icon: TrendingDown, iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400' },
          { label: 'Saved', value: savedThisMonth, icon: PiggyBank, iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', iconBg)}>
                  <Icon className={cn('w-3.5 h-3.5', iconColor)} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <AnimatedNumber value={value} className="text-xl font-bold tracking-tight" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Health Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-violet-500" /> Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !healthScore.hasEnoughData ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Not enough data this month to compute a health score yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AnimatedNumber
                  value={healthScore.score ?? 0}
                  format={n => Math.round(n).toString()}
                  className="text-4xl font-bold tracking-tight tabular-nums"
                />
                <span className="text-lg text-muted-foreground">/ 100</span>
                {healthScore.grade && (
                  <Badge className={cn('ml-auto', GRADE_STYLES[healthScore.grade])}>{healthScore.grade}</Badge>
                )}
              </div>

              <div className="space-y-2">
                {healthScore.breakdown.map(c => (
                  <div key={c.key} className="flex items-center justify-between text-xs gap-3">
                    <span className="text-muted-foreground">{c.label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      {c.reason && <span className="text-muted-foreground truncate">{c.reason}</span>}
                      <span className="font-medium shrink-0 tabular-nums">
                        {c.maxPoints === 0 ? '—' : `${Math.round(c.earnedPoints)}/${c.maxPoints}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top category / biggest improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-500" /> Most Spent On
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : topCategory ? (
              <div>
                <p className="text-lg font-semibold">{topCategory.label}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(topCategory.amount)} ({topCategory.percentage.toFixed(0)}% of spending)</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ImprovementIcon className="w-4 h-4 text-emerald-500" /> Best Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : improvement.label && improvement.percentageDecrease !== null && improvement.percentageDecrease > 0 ? (
              <div>
                <p className="text-lg font-semibold">{improvement.label}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Down {Math.round(improvement.percentageDecrease)}% vs. last month
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {improvement.label === null ? 'No previous month to compare' : 'No category improved this month'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Savings goal status */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          {goalStatus === 'achieved' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {goalStatus === 'missed' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          {goalStatus === 'none' && <PiggyBank className="w-5 h-5 text-muted-foreground shrink-0" />}
          <div>
            <p className="text-sm font-medium">
              {goalStatus === 'achieved' && 'Savings goal achieved'}
              {goalStatus === 'missed' && 'Savings goal missed'}
              {goalStatus === 'none' && 'No savings target set this month'}
            </p>
            {goal && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(savedThisMonth)} of {formatCurrency(goal.target)} target
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <InsightCardsSection insights={insights} isLoading={isLoading} />
    </div>
  );
}
