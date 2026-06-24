'use client';
import { useTheme } from 'next-themes';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MonthlySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: MonthlySummary[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const income   = payload.find(p => p.name === 'income')?.value   ?? 0;
  const expenses = payload.find(p => p.name === 'expenses')?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs space-y-1.5">
      <p className="font-semibold text-sm">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6" style={{ color: p.color }}>
          <span className="capitalize">{p.name}</span>
          <span className="font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-border pt-1.5 flex justify-between text-muted-foreground">
        <span>Net</span>
        <span className={income - expenses >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
          {formatCurrency(income - expenses)}
        </span>
      </div>
    </div>
  );
}

export function MonthlyOverviewChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark    = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={6}>
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          formatter={(v) => <span className="capitalize text-muted-foreground">{v}</span>}
        />
        <Bar dataKey="income"   name="income"   fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
