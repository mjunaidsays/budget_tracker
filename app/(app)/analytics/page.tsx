'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentMonth, formatMonth, formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Calendar, Tag } from 'lucide-react';

const MonthlyOverviewChart   = dynamic(() => import('@/components/analytics/MonthlyOverviewChart').then(m => ({ default: m.MonthlyOverviewChart })), { ssr: false });
const CategoryBreakdownChart = dynamic(() => import('@/components/analytics/CategoryBreakdownChart').then(m => ({ default: m.CategoryBreakdownChart })), { ssr: false });
const SpendingTrendChart     = dynamic(() => import('@/components/analytics/SpendingTrendChart').then(m => ({ default: m.SpendingTrendChart })), { ssr: false });
const DailySpendingChart     = dynamic(() => import('@/components/analytics/DailySpendingChart').then(m => ({ default: m.DailySpendingChart })), { ssr: false });

export default function AnalyticsPage() {
  const [month, setMonth] = useState(getCurrentMonth());

  const {
    isLoading,
    getMonthlyStats,
    getCategoryBreakdown,
    getMonthlyHistory,
    getDailySpending,
    getTopCategory,
    getAvgDailySpend,
  } = useTransactions();

  const stats        = getMonthlyStats(month);
  const categoryData = getCategoryBreakdown(month, 'expense');
  const historyData  = getMonthlyHistory(6);
  const dailyData    = getDailySpending(month);
  const topCategory  = getTopCategory(month);
  const avgDaily     = getAvgDailySpend(month);

  const statCards = [
    {
      label: 'Total Expenses',
      value: formatCurrency(stats.expenses),
      icon: TrendingDown,
      iconBg:    'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: 'Total Income',
      value: formatCurrency(stats.income),
      icon: TrendingUp,
      iconBg:    'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Avg. Daily Spend',
      value: formatCurrency(avgDaily),
      icon: Calendar,
      iconBg:    'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Top Category',
      value: topCategory?.label ?? '—',
      icon: Tag,
      iconBg:    'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm text-muted-foreground">Viewing analytics for</h2>
          <p className="font-semibold">{formatMonth(month)}</p>
        </div>
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-[160px]" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                </div>
              </div>
              {isLoading
                ? <Skeleton className="h-6 w-24" />
                : <p className="text-xl font-bold tracking-tight truncate">{value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">6-Month Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyOverviewChart data={historyData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">{formatMonth(month)}</p>
        </CardHeader>
        <CardContent>
          <CategoryBreakdownChart data={categoryData} total={stats.expenses} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Cumulative Spending</CardTitle>
            <p className="text-xs text-muted-foreground">{formatMonth(month)}</p>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart data={dailyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Daily Spending</CardTitle>
            <p className="text-xs text-muted-foreground">{formatMonth(month)}</p>
          </CardHeader>
          <CardContent>
            <DailySpendingChart data={dailyData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
