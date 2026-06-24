'use client';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Transaction } from '@/lib/types';
import { getCategoryDef } from '@/lib/categories';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { TransactionForm } from './TransactionForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Props {
  transaction: Transaction;
  onUpdate: (id: string, data: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onUpdate, onDelete }: Props) {
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const def     = getCategoryDef(transaction.category);
  const IconComp = (Icons as unknown as Record<string, React.ElementType>)[def.icon] ?? Icons.Circle;
  const isIncome = transaction.type === 'income';

  return (
    <>
      <div className="flex items-center gap-3 py-3 px-1 group hover:bg-muted/40 rounded-lg transition-colors">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', def.bgColor)}>
          <IconComp className="w-4 h-4" style={{ color: def.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">{def.label} · {formatDate(transaction.date)}</p>
        </div>

        <span className={cn(
          'text-sm font-semibold shrink-0',
          isIncome ? 'text-emerald-500' : 'text-rose-500'
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <TransactionForm
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        transaction={transaction}
        onSubmit={data => {
          onUpdate(transaction.id, data);
          setEditOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => onDelete(transaction.id)}
      />
    </>
  );
}
