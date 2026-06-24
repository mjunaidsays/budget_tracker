'use client';
import { useTheme } from 'next-themes';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: MonthlySummary[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span className="capitalize">{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark    = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
        <p className="text-xs text-muted-foreground">Last 6 months</p>
      </CardHeader>
      <CardContent>
        {data.every(d => d.income === 0 && d.expenses === 0) ? (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data yet — add some transactions</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: textColor, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => <span className="capitalize text-muted-foreground">{value}</span>}
              />
              <Bar dataKey="income"   name="income"   fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
