import { Category, TransactionType } from './types';

export interface CategoryDefinition {
  id: Category;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  type: TransactionType | 'both';
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'food-dining',        label: 'Food & Dining',      icon: 'UtensilsCrossed', color: '#f97316', bgColor: 'bg-orange-100 dark:bg-orange-900/30',  type: 'expense' },
  { id: 'transportation',     label: 'Transportation',      icon: 'Car',             color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-900/30',       type: 'expense' },
  { id: 'shopping',           label: 'Shopping',            icon: 'ShoppingBag',     color: '#ec4899', bgColor: 'bg-pink-100 dark:bg-pink-900/30',       type: 'expense' },
  { id: 'entertainment',      label: 'Entertainment',       icon: 'Gamepad2',        color: '#8b5cf6', bgColor: 'bg-violet-100 dark:bg-violet-900/30',   type: 'expense' },
  { id: 'bills-utilities',    label: 'Bills & Utilities',   icon: 'Zap',             color: '#eab308', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',   type: 'expense' },
  { id: 'health-medical',     label: 'Health & Medical',    icon: 'Heart',           color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-900/30',         type: 'expense' },
  { id: 'housing-rent',       label: 'Housing / Rent',      icon: 'Home',            color: '#06b6d4', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',       type: 'expense' },
  { id: 'travel',             label: 'Travel',              icon: 'Plane',           color: '#14b8a6', bgColor: 'bg-teal-100 dark:bg-teal-900/30',       type: 'expense' },
  { id: 'education',          label: 'Education',           icon: 'GraduationCap',   color: '#6366f1', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',   type: 'expense' },
  { id: 'other',              label: 'Other',               icon: 'MoreHorizontal',  color: '#94a3b8', bgColor: 'bg-slate-100 dark:bg-slate-900/30',     type: 'expense' },
  // Expanded expense categories (added in the 2026 modernization pass — existing ids above are untouched)
  { id: 'groceries',          label: 'Groceries',           icon: 'ShoppingCart',    color: '#65a30d', bgColor: 'bg-lime-100 dark:bg-lime-900/30',       type: 'expense' },
  { id: 'subscriptions',      label: 'Subscriptions',       icon: 'RefreshCw',       color: '#a855f7', bgColor: 'bg-purple-100 dark:bg-purple-900/30',   type: 'expense' },
  { id: 'insurance',          label: 'Insurance',           icon: 'ShieldCheck',     color: '#0ea5e9', bgColor: 'bg-sky-100 dark:bg-sky-900/30',         type: 'expense' },
  { id: 'personal-care',      label: 'Personal Care',       icon: 'Sparkles',        color: '#f472b6', bgColor: 'bg-pink-100 dark:bg-pink-900/30',       type: 'expense' },
  { id: 'fitness-wellness',   label: 'Fitness & Wellness',  icon: 'Dumbbell',        color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30',     type: 'expense' },
  { id: 'pets',               label: 'Pets',                icon: 'PawPrint',        color: '#c2410c', bgColor: 'bg-orange-100 dark:bg-orange-900/30',   type: 'expense' },
  { id: 'childcare-family',   label: 'Childcare & Family',  icon: 'Baby',            color: '#db2777', bgColor: 'bg-rose-100 dark:bg-rose-900/30',       type: 'expense' },
  { id: 'gifts-donations',    label: 'Gifts & Donations',   icon: 'Gift',            color: '#e11d48', bgColor: 'bg-red-100 dark:bg-red-900/30',         type: 'expense' },
  { id: 'taxes-fees',         label: 'Taxes & Fees',        icon: 'Receipt',         color: '#475569', bgColor: 'bg-slate-100 dark:bg-slate-900/30',     type: 'expense' },
  { id: 'home-maintenance',   label: 'Home Maintenance',    icon: 'Wrench',          color: '#0d9488', bgColor: 'bg-teal-100 dark:bg-teal-900/30',       type: 'expense' },
  { id: 'electronics-tech',   label: 'Electronics & Tech',  icon: 'Smartphone',      color: '#4f46e5', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',   type: 'expense' },
  { id: 'debt-payments',      label: 'Debt Payments',       icon: 'CreditCard',      color: '#dc2626', bgColor: 'bg-red-100 dark:bg-red-900/30',         type: 'expense' },
  { id: 'salary',             label: 'Salary',              icon: 'Briefcase',       color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', type: 'income'  },
  { id: 'freelance-business', label: 'Freelance / Business',icon: 'Laptop',          color: '#22c55e', bgColor: 'bg-green-100 dark:bg-green-900/30',     type: 'income'  },
  { id: 'other-income',       label: 'Other Income',        icon: 'TrendingUp',      color: '#84cc16', bgColor: 'bg-lime-100 dark:bg-lime-900/30',       type: 'income'  },
  // Expanded income categories
  { id: 'investments',        label: 'Investments',         icon: 'LineChart',       color: '#059669', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', type: 'income'  },
  { id: 'rental-income',      label: 'Rental Income',       icon: 'Building2',       color: '#0891b2', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',       type: 'income'  },
  { id: 'gifts-received',     label: 'Gifts Received',      icon: 'Gift',            color: '#7c3aed', bgColor: 'bg-violet-100 dark:bg-violet-900/30',   type: 'income'  },
  { id: 'refunds-reimbursements', label: 'Refunds & Reimbursements', icon: 'RotateCcw', color: '#16a34a', bgColor: 'bg-green-100 dark:bg-green-900/30', type: 'income'  },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense') as CategoryDefinition[];
export const INCOME_CATEGORIES  = CATEGORIES.filter(c => c.type === 'income')  as CategoryDefinition[];

export function getCategoryDef(id: string): CategoryDefinition {
  return CATEGORIES.find(c => c.id === id) ?? {
    id: id as Category,
    label: id,
    icon: 'Tag',
    color: '#94a3b8',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    type: 'expense',
  };
}
