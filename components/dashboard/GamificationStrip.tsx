'use client';
import { Flame, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { BadgeEarned } from '@/lib/types';
import { BADGE_LABELS } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface Props {
  currentStreakDays: number;
  badges: BadgeEarned[];
  isLoading?: boolean;
}

export function GamificationStrip({ currentStreakDays, badges, isLoading }: Props) {
  const reduceMotion = useReducedMotion();
  if (isLoading || (currentStreakDays === 0 && badges.length === 0)) return null;

  const recentBadges = [...badges].sort((a, b) => b.earnedAt.localeCompare(a.earnedAt)).slice(0, 3);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-wrap items-center gap-2"
    >
      {currentStreakDays > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Flame className="w-3.5 h-3.5" />
          {currentStreakDays}-day under-budget streak
        </div>
      )}
      {recentBadges.map(badge => (
        <div
          key={badge.id}
          className={cn(
            'flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400'
          )}
        >
          <Award className="w-3.5 h-3.5" />
          {BADGE_LABELS[badge.badgeId] ?? badge.badgeId}
        </div>
      ))}
    </motion.div>
  );
}
