'use client';
import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Wallet, Target, PiggyBank, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { SavingsGoalForm } from '@/components/savings/SavingsGoalForm';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useSavings } from '@/hooks/useSavings';
import { getCurrentMonth, cn } from '@/lib/utils';

interface Props {
  onDismiss: () => void;
  onLoadSampleData: () => void;
}

const STEPS = [
  { icon: Wallet, title: 'Add your income', description: "Let's start with what you bring in each month." },
  { icon: Target, title: 'Set a budget', description: 'Pick a category and a monthly spending limit.' },
  { icon: PiggyBank, title: 'Set a savings target', description: "How much would you like to set aside this month?" },
] as const;

/**
 * A thin orchestration shell around the app's existing, already-validated
 * TransactionForm/BudgetForm/SavingsGoalForm — no new form logic, no new
 * persistence path. Each step's submission goes through the real hooks.
 */
export function OnboardingWizard({ onDismiss, onLoadSampleData }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formOpen, setFormOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const { addTransaction } = useTransactions();
  const { setBudget } = useBudgets();
  const { setSavingsGoal } = useSavings();

  const month = getCurrentMonth();
  const current = STEPS[step - 1];

  function advance() {
    setFormOpen(false);
    if (step < 3) {
      setStep(s => (s + 1) as 1 | 2 | 3);
    } else {
      onDismiss();
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-violet-200/60 dark:border-violet-800/40">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Welcome to FinPulse</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Let&apos;s get you set up in three quick steps — you can skip any of them and add things later.
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const done = n < step;
              const active = n === step;
              return (
                <div key={s.title} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                      done && 'bg-emerald-500 text-white',
                      active && !done && 'bg-violet-600 text-white',
                      !active && !done && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : n}
                  </div>
                  {i < STEPS.length - 1 && <div className={cn('w-8 h-0.5', done ? 'bg-emerald-500' : 'bg-muted')} />}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <p className="text-sm font-semibold mb-1">
                Step {step} of 3 — {current.title}
              </p>
              <p className="text-xs text-muted-foreground">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <current.icon className="w-4 h-4" /> {current.title}
            </Button>
            <Button variant="ghost" onClick={advance} className="text-muted-foreground">
              Skip
            </Button>
          </div>

          <button
            onClick={onLoadSampleData}
            className="mt-5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
          >
            Or load sample data to explore instead
          </button>
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen && step === 1}
        onOpenChange={v => { if (!v) advance(); }}
        mode="add"
        initialType="income"
        onSubmit={data => { addTransaction(data); advance(); }}
      />
      <BudgetForm
        open={formOpen && step === 2}
        onOpenChange={v => { if (!v) advance(); }}
        month={month}
        onSubmit={(category, limit) => { setBudget(category, limit, month); advance(); }}
      />
      <SavingsGoalForm
        open={formOpen && step === 3}
        onOpenChange={v => { if (!v) advance(); }}
        month={month}
        onSubmit={(target, savedAside) => { setSavingsGoal(month, target, savedAside); advance(); }}
      />
    </>
  );
}
