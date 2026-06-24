'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/lib/types';
import { getCategoryDef } from '@/lib/categories';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading }: Props) {
  const recent = transactions.slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        <Link href="/transactions" className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-0.5">
            {recent.map(t => {
              const def = getCategoryDef(t.category);
              const Icon = (Icons as unknown as Record<string, React.ElementType>)[def.icon] ?? Icons.Circle;
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', def.bgColor)}>
                    <Icon className="w-4 h-4" style={{ color: def.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                  <span className={cn('text-sm font-semibold shrink-0', t.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
