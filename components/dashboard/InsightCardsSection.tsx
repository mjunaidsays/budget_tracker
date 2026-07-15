'use client';
import * as Icons from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { InsightCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  insights: InsightCard[];
  isLoading?: boolean;
}

const TONE_STYLES: Record<InsightCard['tone'], { border: string; iconBg: string; iconColor: string }> = {
  positive: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  warning:  { border: 'border-l-amber-500',   iconBg: 'bg-amber-100 dark:bg-amber-900/30',     iconColor: 'text-amber-600 dark:text-amber-400' },
  neutral:  { border: 'border-l-slate-400',   iconBg: 'bg-slate-100 dark:bg-slate-800/60',      iconColor: 'text-slate-600 dark:text-slate-400' },
};

export function InsightCardsSection({ insights, isLoading }: Props) {
  const reduceMotion = useReducedMotion();
  if (isLoading || insights.length === 0) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      {insights.map(insight => {
        const tone = TONE_STYLES[insight.tone];
        const Icon = (Icons as unknown as Record<string, React.ElementType>)[insight.icon] ?? Icons.Lightbulb;
        return (
          <motion.div
            key={insight.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'flex items-start gap-3 rounded-xl bg-card ring-1 ring-foreground/10 border-l-4 p-4',
              tone.border
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', tone.iconBg)}>
              <Icon className={cn('w-4 h-4', tone.iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
