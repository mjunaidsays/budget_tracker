-- Adds an optional "paid from savings" flag to expense transactions, so users
-- can explicitly draw down their accumulated savings for a purchase while
-- keeping the transaction fully visible in their normal transaction history
-- (full "every penny" audit trail — nothing about the existing transaction
-- flow changes for users who never use this).
--
-- Purely additive: a single nullable-with-default boolean column on the
-- existing `transactions` table. No data loss — every existing row gets
-- `funded_by_savings = false` automatically, matching today's behavior
-- exactly (100% backward compatible).
--
-- HOW TO RUN: paste into the Supabase SQL Editor and run once (or
-- `supabase db push`). Idempotent — safe to re-run.

alter table public.transactions
  add column if not exists funded_by_savings boolean not null default false;
