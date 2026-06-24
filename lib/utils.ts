import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, subMonths } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatMonth(monthStr: string): string {
  return format(parseISO(monthStr + '-01'), 'MMMM yyyy')
}

export function formatMonthShort(monthStr: string): string {
  return format(parseISO(monthStr + '-01'), 'MMM yy')
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function getPastMonths(count: number): string[] {
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    months.push(format(subMonths(new Date(), i), 'yyyy-MM'))
  }
  return months
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

