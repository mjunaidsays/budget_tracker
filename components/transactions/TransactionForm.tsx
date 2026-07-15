'use client';
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, PiggyBank } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Switch }   from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, today } from '@/lib/utils';
import { Transaction, TransactionType, Category } from '@/lib/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryDef } from '@/lib/categories';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategoryRules } from '@/hooks/useCategoryRules';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  transaction?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  /** Pre-checks "Paid from savings" when opening in add mode — used by the Savings page's quick action. */
  initialFundedBySavings?: boolean;
}


export function TransactionForm({ open, onOpenChange, mode, transaction, onSubmit, initialFundedBySavings }: Props) {
  const [type,        setType]        = useState<TransactionType>('expense');
  const [category,    setCategory]    = useState<Category>('food-dining');
  const [amount,      setAmount]      = useState('');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState('');
  const [fundedBySavings, setFundedBySavings] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  const { budgets, fetchBudgets } = useBudgets();
  const { fetchRules, recordCorrection, suggest } = useCategoryRules();
  const customExpenseCategories = Array.from(new Set(
    budgets.map(b => b.category).filter(cat => !EXPENSE_CATEGORIES.some(c => c.id === cat))
  ));

  useEffect(() => {
    if (open) {
      fetchBudgets();
      fetchRules();
      if (mode === 'edit' && transaction) {
        setType(transaction.type);
        setCategory(transaction.category);
        setAmount(String(transaction.amount));
        setDescription(transaction.description);
        setDate(transaction.date);
        setFundedBySavings(transaction.fundedBySavings);
      } else {
        setType('expense');
        setCategory('food-dining');
        setAmount('');
        setDescription('');
        setDate(today());
        setFundedBySavings(!!initialFundedBySavings);
      }
      setErrors({});
      setJustSubmitted(false);
    }
  }, [open, mode, transaction, fetchBudgets, fetchRules, initialFundedBySavings]);

  useEffect(() => {
    if (mode !== 'add') return; // don't fight the user's existing choice when editing
    if (type === 'expense') setCategory('food-dining');
    else setCategory('salary');
  }, [type, mode]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Debounced, local, rule-based category suggestion — no AI. Never auto-applies.
  const [suggestion, setSuggestion] = useState<{ category: Category; confidence: number } | null>(null);
  useEffect(() => {
    if (!description.trim()) { setSuggestion(null); return; }
    const timer = setTimeout(() => {
      setSuggestion(suggest(description, type));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, type]);

  const suggestedCategoryVisible = useMemo(() => {
    if (!suggestion) return false;
    return (
      categories.some(c => c.id === suggestion.category) ||
      customExpenseCategories.includes(suggestion.category)
    );
  }, [suggestion, categories, customExpenseCategories]);

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
    if (!validate() || justSubmitted) return;

    const data = {
      type,
      category,
      amount: parseFloat(amount),
      description: description.trim(),
      date,
      fundedBySavings: type === 'expense' && fundedBySavings,
    };

    // Feeds the local, deterministic auto-categorization learning loop (no AI/external calls).
    recordCorrection(data.description, data.category, data.type);

    setJustSubmitted(true);
    window.setTimeout(() => onSubmit(data), 260);
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
            <AnimatePresence>
              {suggestion && suggestion.category !== category && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setCategory(suggestion.category)}
                  className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  Suggested: {getCategoryDef(suggestion.category).label} — apply?
                </motion.button>
              )}
            </AnimatePresence>
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
                {suggestion && !suggestedCategoryVisible && (
                  <SelectItem value={suggestion.category}>
                    {getCategoryDef(suggestion.category).label}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* Paid from savings (expense only) */}
          {type === 'expense' && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <PiggyBank className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <Label htmlFor="funded-by-savings" className="cursor-pointer">Paid from savings</Label>
                  <p className="text-xs text-muted-foreground truncate">Draws from your savings instead of this month&apos;s budget</p>
                </div>
              </div>
              <Switch
                id="funded-by-savings"
                checked={fundedBySavings}
                onCheckedChange={v => setFundedBySavings(!!v)}
              />
            </div>
          )}

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={justSubmitted}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={justSubmitted}
              className={cn(
                type === 'expense' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                'text-white min-w-20 disabled:opacity-100'
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {justSubmitted ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> {mode === 'add' ? 'Added' : 'Saved'}
                  </motion.span>
                ) : (
                  <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {mode === 'add' ? 'Add' : 'Save'}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
