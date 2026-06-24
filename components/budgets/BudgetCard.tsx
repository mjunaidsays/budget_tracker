'use client';
import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BudgetWithUsage } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { BudgetForm } from './BudgetForm';
import { DeleteConfirmDialog } from '@/components/transactions/DeleteConfirmDialog';

interface Props {
  budget: BudgetWithUsage;
  onDelete: (id: string) => void;
  onUpdate: (category: BudgetWithUsage['category'], limit: number, month: string) => void;
}

export function BudgetCard({ budget, onDelete, onUpdate }: Props) {
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const Icon = (Icons as unknown as Record<string, React.ElementType>)[budget.icon] ?? Icons.Circle;

  const progressColor = budget.isOverBudget
    ? 'bg-rose-500'
    : budget.percentageUsed > 80
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <>
      <Card className="group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', budget.bgColor)}>
                <Icon className="w-4 h-4" style={{ color: budget.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{budget.label}</p>
                <p className="text-xs text-muted-foreground">Monthly limit</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditOpen(true)} className="p-1 rounded hover:bg-muted transition-colors">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => setDeleteOpen(true)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spent</span>
              <span className={budget.isOverBudget ? 'text-rose-500 font-semibold' : 'font-medium'}>
                {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', progressColor)}
                style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {budget.isOverBudget ? (
              <Badge variant="destructive" className="text-xs">
                Over by {formatCurrency(Math.abs(budget.remaining))}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(budget.remaining)} remaining
              </span>
            )}
            <span className={cn('text-xs font-semibold', budget.isOverBudget ? 'text-rose-500' : 'text-foreground')}>
              {budget.percentageUsed.toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <BudgetForm
        open={editOpen}
        onOpenChange={setEditOpen}
        existingBudget={budget}
        month={budget.month}
        onSubmit={(cat, limit) => { onUpdate(cat, limit, budget.month); setEditOpen(false); }}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Budget"
        onConfirm={() => onDelete(budget.id)}
      />
    </>
  );
}
