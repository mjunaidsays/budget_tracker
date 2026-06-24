import { format, subDays } from 'date-fns';
import { Transaction, Budget } from './types';

function d(daysAgo: number): string {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
}

export function generateSeedTransactions(): Transaction[] {
  let counter = 0;
  function tx(type: Transaction['type'], category: Transaction['category'], amount: number, description: string, daysAgo: number): Transaction {
    counter++;
    const date = d(daysAgo);
    return { id: `seed-${counter}`, type, category, amount, description, date, createdAt: date + 'T10:00:00Z' };
  }

  return [
    // Current month income
    tx('income', 'salary',             4500,  'Monthly Salary',          2),
    tx('income', 'freelance-business',  850,  'Freelance Web Project',    5),
    // Current month expenses
    tx('expense', 'housing-rent',      1200,  'Monthly Rent',             1),
    tx('expense', 'food-dining',         87,  'Grocery Store',            1),
    tx('expense', 'food-dining',         32,  'Restaurant Dinner',        3),
    tx('expense', 'transportation',      45,  'Gas Station',              4),
    tx('expense', 'bills-utilities',    120,  'Electricity Bill',         5),
    tx('expense', 'bills-utilities',     60,  'Internet Bill',            5),
    tx('expense', 'entertainment',       15,  'Netflix Subscription',     6),
    tx('expense', 'shopping',           130,  'Online Shopping',          7),
    tx('expense', 'health-medical',      80,  'Pharmacy',                 8),
    tx('expense', 'food-dining',         22,  'Coffee Shop',              9),
    tx('expense', 'transportation',      30,  'Uber Rides',              10),
    tx('expense', 'education',           50,  'Online Course',           11),
    tx('expense', 'food-dining',         65,  'Lunch with Friends',      12),

    // Last month income
    tx('income', 'salary',             4500,  'Monthly Salary',          32),
    tx('income', 'other-income',        200,  'Cashback Rewards',        35),
    // Last month expenses
    tx('expense', 'housing-rent',      1200,  'Monthly Rent',            31),
    tx('expense', 'food-dining',         95,  'Supermarket',             33),
    tx('expense', 'transportation',      55,  'Car Service',             34),
    tx('expense', 'bills-utilities',    125,  'Electricity Bill',        35),
    tx('expense', 'shopping',           220,  'Clothing Store',          36),
    tx('expense', 'entertainment',       60,  'Concert Tickets',         38),
    tx('expense', 'health-medical',     150,  'Doctor Visit',            40),
    tx('expense', 'travel',             340,  'Weekend Trip',            42),
    tx('expense', 'food-dining',         48,  'Pizza Night',             45),

    // Two months ago income
    tx('income', 'salary',             4500,  'Monthly Salary',          62),
    tx('income', 'freelance-business',  500,  'Design Project',          65),
    // Two months ago expenses
    tx('expense', 'housing-rent',      1200,  'Monthly Rent',            61),
    tx('expense', 'food-dining',        110,  'Grocery Shopping',        63),
    tx('expense', 'entertainment',       35,  'Movie Night',             64),
    tx('expense', 'bills-utilities',    115,  'Electricity Bill',        65),
    tx('expense', 'shopping',            75,  'Books & Stationery',      66),
    tx('expense', 'transportation',      40,  'Monthly Bus Pass',        68),
    tx('expense', 'education',          120,  'Workshop Fee',            70),
    tx('expense', 'health-medical',      45,  'Gym Membership',          72),
  ];
}

export function generateSeedBudgets(): Budget[] {
  const thisMonth = format(new Date(), 'yyyy-MM');
  return [
    { id: 'sb-1', category: 'food-dining',     limit: 400,  month: thisMonth },
    { id: 'sb-2', category: 'transportation',   limit: 150,  month: thisMonth },
    { id: 'sb-3', category: 'shopping',         limit: 300,  month: thisMonth },
    { id: 'sb-4', category: 'entertainment',    limit: 100,  month: thisMonth },
    { id: 'sb-5', category: 'bills-utilities',  limit: 250,  month: thisMonth },
    { id: 'sb-6', category: 'health-medical',   limit: 200,  month: thisMonth },
    { id: 'sb-7', category: 'housing-rent',     limit: 1300, month: thisMonth },
  ];
}
