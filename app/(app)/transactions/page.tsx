'use client';
import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilterBar } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/lib/types';
import { getCurrentMonth, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    month: getCurrentMonth(),
    category: 'all',
    type: 'all',
    search: '',
  });

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        if (filters.month    && !t.date.startsWith(filters.month))                          return false;
        if (filters.category !== 'all' && t.category !== filters.category)                  return false;
        if (filters.type     !== 'all' && t.type     !== filters.type)                      return false;
        if (filters.search   && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, filters]);

  const income   = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <TransactionFilterBar filters={filters} onChange={setFilters} />
        <Button
          onClick={() => setFormOpen(true)}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Transactions', value: String(filtered.length), color: 'text-foreground' },
          { label: 'Income',       value: formatCurrency(income),   color: 'text-emerald-500' },
          { label: 'Expenses',     value: formatCurrency(expenses), color: 'text-rose-500'    },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-base font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
          ) : (
            <TransactionList
              transactions={filtered}
              onUpdate={updateTransaction}
              onDelete={deleteTransaction}
              emptyMessage="No transactions match your filters"
            />
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="add"
        onSubmit={data => { addTransaction(data); setFormOpen(false); }}
      />
    </div>
  );
}
