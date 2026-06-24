'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, ArrowLeftRight, Target, BarChart3, Moon, Sun, Wallet, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

const NAV = [
  { href: '/',              icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { href: '/budgets',       icon: Target,          label: 'Budgets'      },
  { href: '/analytics',     icon: BarChart3,       label: 'Analytics'    },
];

export function MobileNav() {
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useUser();
  const isDark = resolvedTheme === 'dark';
  useEffect(() => setMounted(true), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" />
        }
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">FinTracker</p>
              <p className="text-slate-500 text-xs mt-0.5">Finance Tracker</p>
            </div>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 mt-auto space-y-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold leading-none">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300 text-xs truncate">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {mounted && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{isDark ? 'Dark' : 'Light'} mode</span>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={v => setTheme(v ? 'dark' : 'light')}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
