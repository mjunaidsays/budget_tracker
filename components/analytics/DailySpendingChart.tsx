'use client';
import { useTheme } from 'next-themes';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DailySpending } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: DailySpending[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1">Day {label}</p>
      <p className="text-muted-foreground">
        Spent: <span className="font-medium text-foreground">{formatCurrency(payload[0].value)}</span>
      </p>
    </div>
  );
}

export function DailySpendingChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark    = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const hasData = data.some(d => d.amount > 0);

  if (!hasData) {
    return (
      <div className="h-[220px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No spending data for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
        <YAxis
          tick={{ fill: textColor, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
        <Bar dataKey="amount" fill="#7c3aed" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
