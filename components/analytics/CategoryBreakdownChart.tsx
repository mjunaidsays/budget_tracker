'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategorySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CategorySummary[];
  total: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategorySummary }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold mb-0.5">{d.label}</p>
      <p className="text-muted-foreground">{formatCurrency(d.amount)} · {d.percentage.toFixed(1)}%</p>
    </div>
  );
}

export function CategoryBreakdownChart({ data, total }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No expense data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative flex justify-center">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="amount" strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold leading-tight">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.map(d => (
          <div key={d.category} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm flex-1 truncate">{d.label}</span>
            <span className="text-sm font-medium">{formatCurrency(d.amount)}</span>
            <span className="text-xs text-muted-foreground w-10 text-right">{d.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
