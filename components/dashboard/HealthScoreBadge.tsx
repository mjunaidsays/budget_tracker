'use client';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { HealthScore } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  healthScore: HealthScore;
  isLoading?: boolean;
}

const GRADE_STYLES: Record<string, string> = {
  Excellent: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Great: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Good: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Needs Improvement': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
};

/** Compact "answer everything in 5 seconds" dashboard pill — full breakdown lives on /reports. */
export function HealthScoreBadge({ healthScore, isLoading }: Props) {
  const reduceMotion = useReducedMotion();
  if (isLoading || !healthScore.hasEnoughData || healthScore.score === null || !healthScore.grade) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link
        href="/reports"
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80',
          GRADE_STYLES[healthScore.grade]
        )}
      >
        <HeartPulse className="w-3.5 h-3.5" />
        Health Score: {healthScore.score}/100 · {healthScore.grade}
      </Link>
    </motion.div>
  );
}
