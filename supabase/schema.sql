create extension if not exists "pgcrypto";

create table if not exists players (
  id text primary key,
  handle text not null,
  wallet_address text unique not null,
  cosmetics jsonb not null default '{}'::jsonb,
  cash integer not null default 0,
  sol_earned numeric(12, 6) not null default 0,
  xp integer not null default 0,
  reputation integer not null default 0,
  owned_vehicles text[] not null default array[]::text[],
  inventory jsonb not null default '[]'::jsonb,
  completed_missions text[] not null default array[]::text[],
  wanted_stars integer not null default 0,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references players(id) on delete cascade,
  wallet_address text not null unique,
  provider text not null default 'unknown',
  created_at timestamptz not null default now()
);

create table if not exists missions (
  id text primary key,
  title text not null,
  kind text not null,
  district text not null,
  description text not null,
  target numeric[] not null,
  distance_required numeric not null,
  min_duration_seconds integer not null,
  reward_cash integer not null,
  reward_sol numeric(12, 6) not null,
  reward_xp integer not null,
  reward_reputation integer not null,
  sol_reward_eligible boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references players(id) on delete cascade,
  mission_id text not null,
  claim_id text not null unique,
  cash integer not null,
  sol numeric(12, 6) not null,
  xp integer not null,
  reputation integer not null,
  status text not null check (status in ('approved', 'pending_admin_review', 'paid', 'rejected')),
  verification_payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (player_id, mission_id)
);

create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references players(id) on delete cascade,
  wallet_address text not null,
  amount_sol numeric(12, 6) not null,
  status text not null check (status in ('pending_admin_approval', 'approved', 'paid', 'rejected')),
  transaction_signature text,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id text primary key,
  name text not null,
  speed numeric not null,
  handling numeric not null,
  price integer not null,
  color text not null
);

create table if not exists properties (
  id text primary key,
  name text not null,
  district text not null,
  price integer not null,
  income_per_hour integer not null default 0,
  owner_player_id text references players(id) on delete set null
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references players(id) on delete cascade,
  item_id text not null,
  name text not null,
  item_type text not null,
  quantity integer not null default 1
);

create table if not exists leaderboard (
  player_id text primary key references players(id) on delete cascade,
  reputation integer not null default 0,
  cash integer not null default 0,
  sol_earned numeric(12, 6) not null default 0,
  missions integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function apply_verified_reward(
  player_key text,
  mission_key text,
  reward_cash integer,
  reward_sol numeric,
  reward_xp integer,
  reward_reputation integer
) returns void
language plpgsql
security definer
as $$
begin
  update players
  set
    cash = cash + reward_cash,
    sol_earned = sol_earned + reward_sol,
    xp = xp + reward_xp,
    reputation = reputation + reward_reputation,
    completed_missions = array_append(completed_missions, mission_key),
    updated_at = now()
  where id = player_key
    and not mission_key = any(completed_missions);

  insert into leaderboard (player_id, reputation, cash, sol_earned, missions)
  select id, reputation, cash, sol_earned, cardinality(completed_missions)
  from players
  where id = player_key
  on conflict (player_id)
  do update set
    reputation = excluded.reputation,
    cash = excluded.cash,
    sol_earned = excluded.sol_earned,
    missions = excluded.missions,
    updated_at = now();
end;
$$;

alter table players enable row level security;
alter table wallets enable row level security;
alter table missions enable row level security;
alter table rewards enable row level security;
alter table reward_claims enable row level security;
alter table vehicles enable row level security;
alter table properties enable row level security;
alter table inventory enable row level security;
alter table leaderboard enable row level security;
alter table admin_logs enable row level security;

create policy "public leaderboard read" on leaderboard for select using (true);
create policy "public missions read" on missions for select using (active = true);
create policy "public vehicles read" on vehicles for select using (true);
