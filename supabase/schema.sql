-- Grand Theft Solana (GTS) schema
-- Run in Supabase SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  username text not null,
  cash bigint not null default 500,
  sol_balance numeric(18,6) not null default 0,
  xp bigint not null default 0,
  reputation bigint not null default 0,
  missions_completed integer not null default 0,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text not null unique,
  player_id uuid not null references players(id) on delete cascade,
  provider text not null default 'phantom',
  last_seen_at timestamptz not null default now()
);

create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  mission_run_id text not null unique,
  mission_type text not null,
  wallet_address text not null,
  status text not null check (status in ('active', 'completed', 'failed')),
  started_at timestamptz not null,
  completed_at timestamptz,
  telemetry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default uuid_generate_v4(),
  reward_id text not null unique,
  mission_run_id text not null references missions(mission_run_id) on delete cascade,
  wallet_address text not null,
  cash bigint not null default 0,
  xp bigint not null default 0,
  reputation bigint not null default 0,
  sol numeric(18,6) not null default 0,
  status text not null check (status in ('pending_claim', 'credited', 'claimed')),
  verified boolean not null default false,
  transaction_signature text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create table if not exists vehicles (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text not null,
  model text not null,
  is_equipped boolean not null default false,
  upgrades jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text not null,
  property_type text not null,
  location text not null,
  value bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text not null,
  item_type text not null,
  quantity integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists leaderboard (
  wallet_address text primary key,
  reputation bigint not null default 0,
  cash bigint not null default 0,
  sol_earned numeric(18,6) not null default 0,
  missions_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists admin_logs (
  id uuid primary key default uuid_generate_v4(),
  actor text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function apply_player_reward(
  p_wallet_address text,
  p_cash bigint,
  p_xp bigint,
  p_reputation bigint,
  p_sol numeric
) returns void
language plpgsql
as $$
begin
  insert into players (wallet_address, username, cash, xp, reputation, sol_balance, missions_completed)
  values (p_wallet_address, 'Player-' || substring(p_wallet_address from 1 for 4), 500, 0, 0, 0, 0)
  on conflict (wallet_address) do nothing;

  update players
  set
    cash = cash + p_cash,
    xp = xp + p_xp,
    reputation = reputation + p_reputation,
    sol_balance = sol_balance + p_sol,
    missions_completed = missions_completed + 1,
    updated_at = now()
  where wallet_address = p_wallet_address;

  insert into leaderboard (wallet_address, reputation, cash, sol_earned, missions_completed, updated_at)
  select wallet_address, reputation, cash, sol_balance, missions_completed, now()
  from players
  where wallet_address = p_wallet_address
  on conflict (wallet_address) do update
  set
    reputation = excluded.reputation,
    cash = excluded.cash,
    sol_earned = excluded.sol_earned,
    missions_completed = excluded.missions_completed,
    updated_at = now();
end;
$$;

