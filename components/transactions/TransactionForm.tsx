'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, today } from '@/lib/utils';
import { Transaction, TransactionType, Category } from '@/lib/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { useBudgets } from '@/hooks/useBudgets';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  transaction?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
}


export function TransactionForm({ open, onOpenChange, mode, transaction, onSubmit }: Props) {
  const [type,        setType]        = useState<TransactionType>('expense');
  const [category,    setCategory]    = useState<Category>('food-dining');
  const [amount,      setAmount]      = useState('');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const { budgets, fetchBudgets } = useBudgets();
  const customExpenseCategories = Array.from(new Set(
    budgets.map(b => b.category).filter(cat => !EXPENSE_CATEGORIES.some(c => c.id === cat))
  ));

  useEffect(() => {
    if (open) {
      fetchBudgets();
      if (mode === 'edit' && transaction) {
        setType(transaction.type);
        setCategory(transaction.category);
        setAmount(String(transaction.amount));
        setDescription(transaction.description);
        setDate(transaction.date);
      } else {
        setType('expense');
        setCategory('food-dining');
        setAmount('');
        setDescription('');
        setDate(today());
      }
      setErrors({});
    }
  }, [open, mode, transaction, fetchBudgets]);

  useEffect(() => {
    if (type === 'expense') setCategory('food-dining');
    else setCategory('salary');
  }, [type]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function validate() {
    const e: Record<string, string> = {};
    if (!description.trim())       e.description = 'Description is required';
    if (!amount || isNaN(+amount) || +amount <= 0) e.amount = 'Enter a valid positive amount';
    if (!date)                     e.date = 'Date is required';
    if (!category)                 e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ type, category, amount: parseFloat(amount), description: description.trim(), date });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium capitalize transition-colors',
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Grocery shopping"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={v => v && setCategory(v as Category)}>
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
                {type === 'expense' && customExpenseCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              max={today()}
              value={date}
              onChange={e => setDate(e.target.value)}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              className={cn(
                type === 'expense' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                'text-white'
              )}
            >
              {mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
