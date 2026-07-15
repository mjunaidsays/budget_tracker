'use client';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Dashboard',
  '/transactions':  'Transactions',
  '/budgets':       'Budgets',
  '/savings':       'Savings',
  '/analytics':     'Analytics',
};

interface HeaderProps {
  onAddTransaction: () => void;
}

export function Header({ onAddTransaction }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'FinTracker';

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 flex items-center px-4 lg:px-6 gap-4">
      <MobileNav />
      <h1 className="text-lg font-semibold flex-1">{title}</h1>
      <Button
        onClick={onAddTransaction}
        size="sm"
        className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Transaction</span>
        <span className="sm:hidden">Add</span>
      </Button>
    </header>
  );
}
