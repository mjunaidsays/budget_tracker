'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface Props {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Animated count-up for hero figures. Jumps straight to the final value under prefers-reduced-motion. */
export function AnimatedNumber({ value, format = formatCurrency, duration = 0.6, className }: Props) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const stopRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    if (fromRef.current === value) return;

    stopRef.current?.stop();
    const controls = animate(fromRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setDisplay(v),
      onComplete: () => { fromRef.current = value; },
    });
    stopRef.current = controls;

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <span className={className}>{format(display)}</span>;
}
