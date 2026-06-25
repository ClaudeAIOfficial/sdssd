-- Grand Theft Solana - Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  cash INTEGER NOT NULL DEFAULT 1000,
  sol_earned DECIMAL(18, 9) NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  health INTEGER NOT NULL DEFAULT 100,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  skin_tone TEXT NOT NULL DEFAULT '#F4C88E',
  hair_style TEXT NOT NULL DEFAULT 'short',
  clothes_style TEXT NOT NULL DEFAULT 'casual',
  shoes_style TEXT NOT NULL DEFAULT 'sneakers',
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_reputation ON players(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_players_sol_earned ON players(sol_earned DESC);

-- Missions table (for static/admin-created missions)
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cash_reward INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  reputation_reward INTEGER NOT NULL DEFAULT 0,
  sol_reward DECIMAL(18, 9) NOT NULL DEFAULT 0,
  time_limit INTEGER NOT NULL DEFAULT 120,
  location_x DECIMAL(10, 2) NOT NULL DEFAULT 0,
  location_y DECIMAL(10, 2) NOT NULL DEFAULT 0,
  location_z DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type);
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(is_active);

-- Mission completions table (anti-cheat log)
CREATE TABLE IF NOT EXISTS mission_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  distance_traveled INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completions_player ON mission_completions(player_id);
CREATE INDEX IF NOT EXISTS idx_completions_mission ON mission_completions(mission_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_unique ON mission_completions(mission_id, player_id);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  amount_sol DECIMAL(18, 9) NOT NULL,
  tx_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'failed', 'rejected')),
  admin_approved_by TEXT,
  admin_approved_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_player ON rewards(player_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards(status);
CREATE INDEX IF NOT EXISTS idx_rewards_wallet ON rewards(wallet_address);

-- Properties table (apartments, garages, etc.)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  location_x DECIMAL(10, 2),
  location_z DECIMAL(10, 2),
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles owned by players
CREATE TABLE IF NOT EXISTS owned_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);

-- Admin logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_player TEXT,
  target_wallet TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  wallet_address,
  username,
  reputation,
  cash,
  sol_earned,
  xp,
  level,
  missions_completed,
  RANK() OVER (ORDER BY reputation DESC) AS reputation_rank,
  RANK() OVER (ORDER BY sol_earned DESC) AS sol_rank,
  RANK() OVER (ORDER BY cash DESC) AS cash_rank,
  RANK() OVER (ORDER BY missions_completed DESC) AS missions_rank
FROM players
WHERE is_banned = FALSE;

-- Helper function to add SOL to a player
CREATE OR REPLACE FUNCTION add_player_sol(p_wallet TEXT, p_amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE players
  SET sol_earned = sol_earned + p_amount,
      updated_at = NOW()
  WHERE wallet_address = p_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to add cash to a player
CREATE OR REPLACE FUNCTION add_player_cash(p_wallet TEXT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE players
  SET cash = cash + p_amount,
      updated_at = NOW()
  WHERE wallet_address = p_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to add XP to a player
CREATE OR REPLACE FUNCTION add_player_xp(p_wallet TEXT, p_amount INTEGER)
RETURNS void AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE players
  SET xp = xp + p_amount,
      updated_at = NOW()
  WHERE wallet_address = p_wallet
  RETURNING xp INTO new_xp;

  -- Recalculate level
  new_level := FLOOR(SQRT(new_xp::float / 100)) + 1;

  UPDATE players
  SET level = new_level
  WHERE wallet_address = p_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Players can read their own data
CREATE POLICY "Players can read own data" ON players
  FOR SELECT USING (true); -- Public leaderboard

CREATE POLICY "Service role can do anything on players" ON players
  USING (auth.role() = 'service_role');

-- Seed data (example missions)
INSERT INTO missions (type, title, description, difficulty, cash_reward, xp_reward, reputation_reward, sol_reward, time_limit, location_x, location_z)
VALUES
  ('delivery', 'Crypto Package Drop', 'Deliver a mysterious encrypted package to the harbor.', 'easy', 500, 50, 10, 0, 120, 20, 20),
  ('race', 'Neon Street Race', 'First to finish the circuit wins the pot.', 'hard', 3000, 300, 50, 0.05, 300, 50, -10),
  ('collect_wallets', 'Crypto Hunt', 'Collect hidden wallets across the city.', 'medium', 800, 100, 20, 0.01, 240, -30, 15),
  ('defeat_gang', 'Territory Takeover', 'Show the Byte Crew who runs this city.', 'hard', 2000, 200, 40, 0.03, 300, 60, 40),
  ('protect_npc', 'Bodyguard Duty', 'Keep this whale safe while they transact.', 'medium', 1000, 100, 25, 0.02, 180, -20, -40)
ON CONFLICT DO NOTHING;
