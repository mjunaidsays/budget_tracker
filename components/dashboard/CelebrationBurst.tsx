'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Props {
  active: boolean;
  onComplete: () => void;
}

const PARTICLE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];
const PARTICLES = 10;

/** A small, tasteful celebration burst for savings/streak milestones — no external confetti lib. */
export function CelebrationBurst({ active, onComplete }: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onComplete, reduceMotion ? 50 : 900);
    return () => clearTimeout(timer);
  }, [active, onComplete, reduceMotion]);

  return (
    <AnimatePresence>
      {active && !reduceMotion && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center">
          <div className="relative w-1 h-1">
            {Array.from({ length: PARTICLES }).map((_, i) => {
              const angle = (i / PARTICLES) * Math.PI * 2;
              const distance = 60 + Math.random() * 40;
              return (
                <motion.span
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: PARTICLE_COLORS[i % PARTICLE_COLORS.length] }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 20,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              );
            })}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
