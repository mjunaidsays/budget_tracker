'use client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [formOpen, setFormOpen] = useState(false);
  const { addTransaction } = useTransactions();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onAddTransaction={() => setFormOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="add"
        onSubmit={data => {
          addTransaction(data);
          setFormOpen(false);
        }}
      />
    </div>
  );
}
