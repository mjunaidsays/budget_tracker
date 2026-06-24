'use client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';
import { TransactionFilters } from '@/lib/types';

interface Props {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ filters, onChange }: Props) {
  const set = (key: keyof TransactionFilters, val: string) =>
    onChange({ ...filters, [key]: val });

  const hasFilters = filters.category !== 'all' || filters.type !== 'all' || filters.search !== '';

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="pl-9"
        />
      </div>

      <Input
        type="month"
        value={filters.month}
        onChange={e => set('month', e.target.value)}
        className="w-[160px]"
      />

      <Select value={filters.type} onValueChange={v => set('type', v ?? 'all')}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={v => set('category', v ?? 'all')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...filters, category: 'all', type: 'all', search: '' })}
          className="gap-1 text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}
