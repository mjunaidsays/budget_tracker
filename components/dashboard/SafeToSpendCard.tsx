'use client';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Wallet, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeToSpend } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

interface Props {
  safeToSpend: SafeToSpend;
  totalSaved?: number;
  isLoading?: boolean;
}

function AnimatedAmount({ value, className }: { value: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={className}
      >
        {formatCurrency(value)}
      </motion.span>
    </AnimatePresence>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  caption,
  emptyState,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  caption?: string;
  emptyState?: { message: string; href: string; cta: string };
}) {
  const negative = value < 0;

  if (emptyState) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{emptyState.message}</p>
        <Link
          href={emptyState.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          {emptyState.cta} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {negative && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
        <AnimatedAmount
          value={value}
          className={cn(
            'text-2xl font-bold tracking-tight tabular-nums',
            negative ? 'text-rose-500' : 'text-foreground'
          )}
        />
      </div>
      {caption && <p className="text-xs text-muted-foreground mt-1">{caption}</p>}
    </div>
  );
}

export function SafeToSpendCard({ safeToSpend, totalSaved, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i}>
                <Skeleton className="h-4 w-28 mb-3" />
                <Skeleton className="h-7 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { plannedRemaining, cashRemaining, hasBudgets, hasSavingsGoal, savingsTarget } = safeToSpend;

  return (
    <Card className="overflow-hidden border-violet-200/60 dark:border-violet-800/40">
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4 sm:divide-x sm:divide-border">
          <div className="sm:pr-4">
            {hasBudgets ? (
              <Metric
                icon={Wallet}
                label="Safe to Spend"
                value={plannedRemaining}
                caption={
                  hasSavingsGoal
                    ? `Based on your budgets, after a ${formatCurrency(savingsTarget)} savings target`
                    : 'Based on your budgets · no savings target set'
                }
              />
            ) : (
              <Metric
                icon={Wallet}
                label="Safe to Spend"
                value={0}
                emptyState={{
                  message: 'Set a budget to see how much you can safely spend this month.',
                  href: '/budgets',
                  cta: 'Set a budget',
                }}
              />
            )}
          </div>
          <div className="sm:pl-4">
            <Metric
              icon={PiggyBank}
              label="Cash Remaining"
              value={cashRemaining}
              caption={
                hasSavingsGoal
                  ? 'What you physically have left after actual spending & savings'
                  : "What you physically have left — set a savings target for a fuller picture"
              }
            />
          </div>
        </div>
        {totalSaved !== undefined && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Total saved: <span className="font-semibold text-foreground">{formatCurrency(totalSaved)}</span>
            </p>
            <Link
              href="/savings"
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline shrink-0"
            >
              View savings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
