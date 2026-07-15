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
  /** True when this expense was paid out of accumulated savings rather than regular income. */
  fundedBySavings: boolean;
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

export interface SavingsGoal {
  id: string;
  month: string; // 'YYYY-MM'
  target: number;
  savedAside: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCorrectionRule {
  id: string;
  keyword: string;
  category: Category;
  type: TransactionType;
  hits: number;
  lastUsedAt: string;
}

export interface GamificationState {
  currentStreakDays: number;
  longestStreakDays: number;
  lastEvaluatedDate: string | null;
}

export interface BadgeEarned {
  id: string;
  badgeId: string;
  earnedAt: string;
  meta?: Record<string, unknown>;
}

export interface SafeToSpend {
  /** income − total budgeted (planned) limits for the month − savings target */
  plannedRemaining: number;
  /** income − actual spend so far this month − savings target */
  cashRemaining: number;
  /** false when no budgets exist for the month — plannedRemaining should not be shown as authoritative */
  hasBudgets: boolean;
  /** false when no savings goal exists for the month — savingsTarget was treated as 0 */
  hasSavingsGoal: boolean;
  savingsTarget: number;
}

export type InsightTone = 'positive' | 'warning' | 'neutral';

export interface InsightCard {
  id: string;
  tone: InsightTone;
  title: string;
  description: string;
  icon: string;
}

export interface BudgetWarning {
  category: string;
  label: string;
  level: 'warning' | 'critical';
  percentageUsed: number;
}

export interface SavingsSummary {
  /** Running lifetime total: all monthly contributions minus all savings-funded withdrawals. */
  totalSaved: number;
  totalContributed: number;
  totalWithdrawn: number;
}
