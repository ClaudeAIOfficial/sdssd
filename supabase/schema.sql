-- Grand Theft Solana (GTS) — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) to provision the
-- backend. The game also runs with NO database (in-memory fallback) for local
-- development, so this is only required for persistent, multi-user deployments.

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------
create table if not exists public.players (
  id                 text primary key,
  wallet             text unique,
  handle             text not null,
  cash               numeric not null default 500,
  sol                numeric not null default 0,
  xp                 integer not null default 0,
  level              integer not null default 1,
  reputation         integer not null default 0,
  missions_completed integer not null default 0,
  appearance         jsonb   not null default '{}'::jsonb,
  banned             boolean not null default false,
  created_at         timestamptz not null default now()
);
create index if not exists players_reputation_idx on public.players (reputation desc);
create index if not exists players_sol_idx on public.players (sol desc);

-- ---------------------------------------------------------------------------
-- Wallets (1:1 with players, for richer on-chain metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.wallets (
  address    text primary key,
  player_id  text references public.players(id) on delete cascade,
  network    text not null default 'devnet',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Missions (server-authored / generated jobs)
-- ---------------------------------------------------------------------------
create table if not exists public.missions (
  id          text primary key,
  type        text not null,
  title       text not null,
  description text,
  giver       text,
  difficulty  integer not null default 1,
  reward_cash numeric not null default 0,
  reward_xp   integer not null default 0,
  reward_rep  integer not null default 0,
  reward_sol  numeric not null default 0,
  verifiable  boolean not null default false,
  origin      jsonb,
  target      jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rewards (the source of truth for payouts — backend verified)
-- ---------------------------------------------------------------------------
create table if not exists public.rewards (
  id         text primary key,
  player_id  text not null references public.players(id) on delete cascade,
  mission_id text not null,
  cash       numeric not null default 0,
  xp         integer not null default 0,
  reputation integer not null default 0,
  sol        numeric not null default 0,
  status     text not null default 'pending', -- pending | approved | rejected | paid
  signature  text,
  created_at timestamptz not null default now()
);
create index if not exists rewards_player_idx on public.rewards (player_id, created_at desc);
create index if not exists rewards_status_idx on public.rewards (status);

-- ---------------------------------------------------------------------------
-- Vehicles owned by players
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id         text primary key,
  player_id  text references public.players(id) on delete cascade,
  kind       text not null,
  color      text,
  acquired_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Properties owned by players (apartments, safehouses)
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id         text primary key,
  player_id  text references public.players(id) on delete cascade,
  landmark   text not null,
  price      numeric not null default 0,
  bought_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inventory items per player
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id         bigint generated always as identity primary key,
  player_id  text references public.players(id) on delete cascade,
  item_id    text not null,
  name       text not null,
  kind       text not null,
  qty        integer not null default 1
);

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_logs (
  id         text primary key,
  action     text not null,
  detail     text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leaderboard view (top players, derived from players)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard as
select
  handle,
  wallet,
  reputation,
  cash,
  sol  as sol_earned,
  missions_completed
from public.players
where banned = false
order by reputation desc;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The server uses the service-role key (bypasses RLS). If you expose the anon
-- key to the browser, enable RLS and add policies that suit your trust model.
-- For this demo the API routes are the only writers, so RLS can stay disabled.
-- ---------------------------------------------------------------------------
-- alter table public.players enable row level security;
-- alter table public.rewards enable row level security;
