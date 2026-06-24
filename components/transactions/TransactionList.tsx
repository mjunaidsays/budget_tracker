'use client';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Transaction } from '@/lib/types';
import { TransactionItem } from './TransactionItem';
import { Receipt } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onUpdate: (id: string, data: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function TransactionList({ transactions, onUpdate, onDelete, emptyMessage = 'No transactions found' }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const existing = map.get(t.date) ?? [];
      existing.push(t);
      map.set(t.date, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Receipt className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">
            {format(parseISO(date), 'EEEE, MMMM d')}
          </p>
          <div className="divide-y divide-border/50">
            {txs.map(t => (
              <TransactionItem key={t.id} transaction={t} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
