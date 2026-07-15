'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { SavingsGoal } from '@/lib/types';
import { formatMonth } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  existingGoal?: SavingsGoal;
  onSubmit: (target: number, savedAside: number) => void;
}

export function SavingsGoalForm({ open, onOpenChange, month, existingGoal, onSubmit }: Props) {
  const [target,     setTarget]     = useState('');
  const [savedAside, setSavedAside] = useState('');
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTarget(existingGoal ? String(existingGoal.target) : '');
      setSavedAside(existingGoal ? String(existingGoal.savedAside) : '');
      setErrors({});
    }
  }, [open, existingGoal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!target || isNaN(+target) || +target <= 0) errs.target = 'Enter a valid amount';
    if (savedAside && (isNaN(+savedAside) || +savedAside < 0)) errs.savedAside = 'Enter a valid amount';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(parseFloat(target), savedAside ? parseFloat(savedAside) : 0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{existingGoal ? 'Edit Savings Target' : 'Set Savings Target'}</DialogTitle>
          <DialogDescription>For {formatMonth(month)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="target">Monthly Target (USD)</Label>
            <Input
              id="target"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 500"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className={errors.target ? 'border-destructive' : ''}
              autoFocus
            />
            {errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="savedAside">Already Set Aside (optional)</Label>
            <Input
              id="savedAside"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={savedAside}
              onChange={e => setSavedAside(e.target.value)}
              className={errors.savedAside ? 'border-destructive' : ''}
            />
            {errors.savedAside && <p className="text-xs text-destructive">{errors.savedAside}</p>}
            <p className="text-xs text-muted-foreground">
              If you&apos;ve already moved money into savings this month, log it here to track progress accurately.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save Target</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
