-- FinPulse additive feature schema (2026 modernization pass).
--
-- This migration is PURELY ADDITIVE: it only creates new tables. It never
-- ALTERs or DROPs `transactions` or `budgets`, so existing data is
-- completely untouched. It is idempotent (`if not exists` everywhere),
-- so it is safe to re-run.
--
-- RLS NOTE: this assumes your existing `transactions`/`budgets` tables use
-- the standard Supabase "owner can CRUD own rows" pattern, i.e. a
-- `user_id uuid references auth.users(id)` column with row-level security
-- policies scoped by `auth.uid() = user_id`. Before running this, check
-- your existing policies (Supabase Dashboard > Authentication > Policies,
-- or `select * from pg_policies where tablename in ('transactions','budgets')`)
-- and adjust the policy definitions below if your project uses a different
-- convention (e.g. a custom claims-based scheme).
--
-- HOW TO RUN: paste this file into the Supabase SQL Editor and run it once,
-- or `supabase db push` if you manage schema via the Supabase CLI locally.
--
-- HOW TO VERIFY: after running, confirm the 4 tables below exist with RLS
-- enabled, and confirm `select count(*) from transactions` / `budgets`
-- match their pre-migration counts (unchanged).

-- 1. Per-month savings targets ----------------------------------------------
create table if not exists public.savings_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  month       text not null,              -- 'YYYY-MM', mirrors budgets.month convention
  target      numeric(12,2) not null check (target >= 0),
  saved_aside numeric(12,2) not null default 0 check (saved_aside >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists savings_goals_user_month_idx on public.savings_goals (user_id, month);

alter table public.savings_goals enable row level security;

drop policy if exists "savings_goals_select_own" on public.savings_goals;
create policy "savings_goals_select_own" on public.savings_goals
  for select using (auth.uid() = user_id);

drop policy if exists "savings_goals_insert_own" on public.savings_goals;
create policy "savings_goals_insert_own" on public.savings_goals
  for insert with check (auth.uid() = user_id);

drop policy if exists "savings_goals_update_own" on public.savings_goals;
create policy "savings_goals_update_own" on public.savings_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_goals_delete_own" on public.savings_goals;
create policy "savings_goals_delete_own" on public.savings_goals
  for delete using (auth.uid() = user_id);

-- 2. Auto-categorization learning (keyword -> category rules) ---------------
create table if not exists public.category_correction_rules (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  keyword      text not null,              -- normalized lowercase token extracted from a transaction description
  category     text not null,              -- Category id (built-in or custom string, same domain as budgets.category)
  type         text not null check (type in ('income', 'expense')),
  hits         integer not null default 1, -- number of times this keyword -> category pairing was confirmed
  last_used_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (user_id, keyword, type)
);

create index if not exists category_correction_rules_user_idx on public.category_correction_rules (user_id);

alter table public.category_correction_rules enable row level security;

drop policy if exists "category_rules_select_own" on public.category_correction_rules;
create policy "category_rules_select_own" on public.category_correction_rules
  for select using (auth.uid() = user_id);

drop policy if exists "category_rules_insert_own" on public.category_correction_rules;
create policy "category_rules_insert_own" on public.category_correction_rules
  for insert with check (auth.uid() = user_id);

drop policy if exists "category_rules_update_own" on public.category_correction_rules;
create policy "category_rules_update_own" on public.category_correction_rules
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "category_rules_delete_own" on public.category_correction_rules;
create policy "category_rules_delete_own" on public.category_correction_rules
  for delete using (auth.uid() = user_id);

-- 3. Gamification: streak state ----------------------------------------------
create table if not exists public.gamification_state (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  current_streak_days  integer not null default 0,
  longest_streak_days  integer not null default 0,
  last_evaluated_date  text,              -- 'YYYY-MM-DD', last day the streak/badge evaluation ran
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

alter table public.gamification_state enable row level security;

drop policy if exists "gamification_state_select_own" on public.gamification_state;
create policy "gamification_state_select_own" on public.gamification_state
  for select using (auth.uid() = user_id);

drop policy if exists "gamification_state_insert_own" on public.gamification_state;
create policy "gamification_state_insert_own" on public.gamification_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "gamification_state_update_own" on public.gamification_state;
create policy "gamification_state_update_own" on public.gamification_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "gamification_state_delete_own" on public.gamification_state;
create policy "gamification_state_delete_own" on public.gamification_state
  for delete using (auth.uid() = user_id);

-- 4. Gamification: earned badges ---------------------------------------------
create table if not exists public.badges_earned (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  badge_id  text not null,              -- e.g. 'first-budget', 'streak-7', 'savings-hit-2026-07'
  earned_at timestamptz not null default now(),
  meta      jsonb,                      -- optional context, e.g. { "month": "2026-07", "streak": 7 }
  unique (user_id, badge_id)
);

create index if not exists badges_earned_user_idx on public.badges_earned (user_id);

alter table public.badges_earned enable row level security;

drop policy if exists "badges_earned_select_own" on public.badges_earned;
create policy "badges_earned_select_own" on public.badges_earned
  for select using (auth.uid() = user_id);

drop policy if exists "badges_earned_insert_own" on public.badges_earned;
create policy "badges_earned_insert_own" on public.badges_earned
  for insert with check (auth.uid() = user_id);

drop policy if exists "badges_earned_delete_own" on public.badges_earned;
create policy "badges_earned_delete_own" on public.badges_earned
  for delete using (auth.uid() = user_id);
