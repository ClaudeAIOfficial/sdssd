create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  handle text not null,
  currencies jsonb not null default '{"cash":1250,"sol":0,"xp":0,"reputation":0}'::jsonb,
  character jsonb not null,
  inventory jsonb not null,
  vehicles jsonb not null,
  wanted_stars integer not null default 0 check (wanted_stars between 0 and 5),
  banned boolean not null default false,
  missions_completed integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  wallet_address text not null,
  provider text not null default 'solana',
  verified_at timestamptz not null default now(),
  unique (player_id, wallet_address)
);

create table if not exists missions (
  id text primary key,
  title text not null,
  type text not null check (type in ('delivery','taxi','race','collect','defeat','protect','heist','recover')),
  district text not null,
  briefing text not null,
  objective text not null,
  start_position numeric[] not null,
  target_position numeric[] not null,
  min_seconds integer not null,
  max_seconds integer not null,
  required_distance numeric not null,
  rewards jsonb not null,
  sol_eligible boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  mission_id text not null,
  cash integer not null default 0,
  xp integer not null default 0,
  reputation integer not null default 0,
  sol numeric(12, 6) not null default 0,
  status text not null check (status in ('pending','approved','paid','rejected')),
  tx_signature text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz,
  unique (player_id, mission_id)
);

create table if not exists vehicles (
  id text primary key,
  player_id uuid references players(id) on delete cascade,
  name text not null,
  type text not null,
  price integer not null,
  speed numeric not null,
  handling numeric not null,
  color text not null,
  owned boolean not null default false
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  name text not null,
  district text not null,
  price integer not null,
  owned boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  item_key text not null,
  name text not null,
  category text not null,
  description text not null,
  quantity integer not null default 1,
  unique (player_id, item_key)
);

create table if not exists leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  reputation integer not null default 0,
  cash integer not null default 0,
  sol_earned numeric(12, 6) not null default 0,
  missions_completed integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (player_id)
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_players_wallet_address on players(wallet_address);
create index if not exists idx_rewards_player_status on rewards(player_id, status);
create index if not exists idx_missions_enabled on missions(enabled);
create index if not exists idx_leaderboard_reputation on leaderboard(reputation desc);

alter table players enable row level security;
alter table wallets enable row level security;
alter table missions enable row level security;
alter table rewards enable row level security;
alter table vehicles enable row level security;
alter table properties enable row level security;
alter table inventory enable row level security;
alter table leaderboard enable row level security;
alter table admin_logs enable row level security;

create policy "Public can read enabled missions" on missions for select using (enabled = true);
create policy "Public can read leaderboard" on leaderboard for select using (true);

-- Server API routes should use SUPABASE_SERVICE_ROLE_KEY for writes and reward approvals.
