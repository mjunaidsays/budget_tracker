export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'food-dining'
  | 'transportation'
  | 'shopping'
  | 'entertainment'
  | 'bills-utilities'
  | 'health-medical'
  | 'housing-rent'
  | 'travel'
  | 'education'
  | 'other'
  | (string & {});

export type IncomeCategory = 'salary' | 'freelance-business' | 'other-income';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  description: string;
  date: string; // 'YYYY-MM-DD'
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  month: string; // 'YYYY-MM'
}

export interface MonthlySummary {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savingsRate: number;
}

export interface CategorySummary {
  category: Category;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  bgColor: string;
}

export interface BudgetWithUsage extends Budget {
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  label: string;
  color: string;
  icon: string;
  bgColor: string;
}

export interface DailySpending {
  day: string;
  amount: number;
  cumulative: number;
}

export interface TransactionFilters {
  month: string;
  category: string;
  type: string;
  search: string;
}
