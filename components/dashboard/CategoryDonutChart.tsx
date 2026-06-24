'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function CategoryDonutChart({ data, total }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
        <p className="text-xs text-muted-foreground">This month</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No expenses this month</p>
          </div>
        ) : (
          <>
            <div className="relative flex justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-base font-bold leading-tight">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">Total spent</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {data.slice(0, 5).map(d => (
                <div key={d.category} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{d.label}</span>
                  <span className="text-xs font-medium">{d.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
