'use client';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  loading: boolean;
  submitLabel: string;
  footer: React.ReactNode;
  successMessage?: string;
}

export function AuthForm({
  title, subtitle, onSubmit,
  email, setEmail, password, setPassword,
  error, loading, submitLabel, footer, successMessage,
}: Props) {
  return (
    <Card className="w-full max-w-sm border-border bg-card shadow-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground">FinTracker</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardHeader>

      <CardContent className="px-6 pb-8">
        {successMessage ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-foreground font-medium">{successMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">Check your inbox and click the link to verify.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={title === 'Sign In' ? 'current-password' : 'new-password'}
                minLength={6}
                className="h-9"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9"
            >
              {loading ? 'Please wait…' : submitLabel}
            </Button>
          </form>
        )}

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {footer}
        </div>
      </CardContent>
    </Card>
  );
}
