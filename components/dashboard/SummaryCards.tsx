'use client';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, cn } from '@/lib/utils';

interface Props {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  isLoading?: boolean;
}

const CARDS = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: Wallet,
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    valueColor: 'text-foreground',
  },
  {
    key: 'income',
    label: 'Monthly Income',
    icon: TrendingUp,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'expenses',
    label: 'Monthly Expenses',
    icon: TrendingDown,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    valueColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'savings',
    label: 'Savings Rate',
    icon: PiggyBank,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-foreground',
  },
] as const;

export function SummaryCards({ totalBalance, monthlyIncome, monthlyExpenses, savingsRate, isLoading }: Props) {
  const values = {
    balance:  formatCurrency(totalBalance),
    income:   formatCurrency(monthlyIncome),
    expenses: formatCurrency(monthlyExpenses),
    savings:  `${savingsRate.toFixed(1)}%`,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <Card key={c.key} className="p-5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-7 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, iconBg, iconColor, valueColor }) => (
        <Card key={key} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
                <Icon className={cn('w-4 h-4', iconColor)} />
              </div>
            </div>
            <p className={cn('text-2xl font-bold tracking-tight', valueColor)}>
              {values[key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
