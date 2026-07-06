'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { ExpenseCategory } from '@/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  existingBudget?: { category: ExpenseCategory; limit: number };
  excludeCategories?: ExpenseCategory[];
  onSubmit: (category: ExpenseCategory, limit: number) => void;
}

const CUSTOM_SENTINEL = '__custom__';

export function BudgetForm({ open, onOpenChange, existingBudget, excludeCategories = [], onSubmit }: Props) {
  const [category,   setCategory]   = useState<ExpenseCategory>('food-dining');
  const [customName, setCustomName] = useState('');
  const [limit,      setLimit]      = useState('');
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const availableCategories = EXPENSE_CATEGORIES.filter(
    c => !excludeCategories.includes(c.id as ExpenseCategory) || c.id === existingBudget?.category
  );

  useEffect(() => {
    if (open) {
      const cat = existingBudget?.category ?? 'food-dining';
      const isKnown = EXPENSE_CATEGORIES.some(c => c.id === cat);
      if (existingBudget && !isKnown) {
        setCategory(CUSTOM_SENTINEL as ExpenseCategory);
        setCustomName(cat);
      } else {
        setCategory((isKnown ? cat : 'food-dining') as ExpenseCategory);
        setCustomName('');
      }
      setLimit(existingBudget ? String(existingBudget.limit) : '');
      setErrors({});
    }
  }, [open, existingBudget]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!limit || isNaN(+limit) || +limit <= 0) errs.limit = 'Enter a valid amount';
    const isCustom = category === CUSTOM_SENTINEL;
    if (isCustom && !customName.trim()) errs.category = 'Enter a category name';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit((isCustom ? customName.trim() : category) as ExpenseCategory, parseFloat(limit));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{existingBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={v => {
                if (v) {
                  setCategory(v as ExpenseCategory);
                  if (v !== CUSTOM_SENTINEL) setCustomName('');
                }
              }}
              disabled={!!existingBudget}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value={CUSTOM_SENTINEL}>Custom…</SelectItem>
              </SelectContent>
            </Select>

            {category === CUSTOM_SENTINEL && (
              <div className="space-y-1.5 mt-2">
                <Input
                  autoFocus
                  placeholder="e.g. Hobbies"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  disabled={!!existingBudget}
                  className={errors.category ? 'border-destructive' : ''}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limit">Monthly Limit (USD)</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 500"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className={errors.limit ? 'border-destructive' : ''}
            />
            {errors.limit && <p className="text-xs text-destructive">{errors.limit}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
