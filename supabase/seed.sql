-- Grand Theft Solana - Seed Data
-- Run after schema.sql

-- Insert example missions
INSERT INTO missions (type, title, description, difficulty, cash_reward, xp_reward, reputation_reward, sol_reward, time_limit, location_x, location_z, is_active)
VALUES
  ('delivery', 'Crypto Package Drop', 'Deliver a mysterious encrypted package to the harbor. No questions asked.', 'easy', 500, 50, 10, 0, 120, 20, 20, true),
  ('delivery', 'Hot Hardware Delivery', 'Get this hardware wallet to the buyer before the competition does.', 'medium', 1200, 120, 25, 0.01, 90, -30, 15, true),
  ('taxi', 'VIP Transfer', 'Transport a high-value client across the city safely.', 'easy', 300, 30, 5, 0, 180, 50, -10, true),
  ('race', 'Neon Street Race', 'First to finish the neon-lit circuit wins the pot.', 'hard', 3000, 300, 50, 0.05, 300, 50, -10, true),
  ('race', 'Harbor Sprint', 'Quick race along the waterfront.', 'medium', 1500, 150, 30, 0.02, 180, -20, -40, true),
  ('collect_wallets', 'Crypto Hunt', 'Collect hidden wallets scattered across the city.', 'medium', 800, 100, 20, 0.01, 240, 10, 60, true),
  ('defeat_gang', 'Territory Takeover', 'The Byte Crew is moving in. Show them who runs this city.', 'hard', 2000, 200, 40, 0.03, 300, 60, 40, true),
  ('protect_npc', 'Bodyguard Duty', 'Keep this whale safe during their transaction.', 'medium', 1000, 100, 25, 0.02, 180, -60, 30, true),
  ('steal_package', 'Corporate Espionage', 'Intercept the rival crew''s delivery.', 'hard', 2500, 250, 45, 0.04, 240, 80, 80, true),
  ('find_hardware_wallet', 'Lost Ledger', 'Find a lost hardware wallet before someone else does.', 'easy', 600, 60, 15, 0, 300, -80, -80, true)
ON CONFLICT DO NOTHING;

-- Insert demo players for leaderboard
INSERT INTO players (wallet_address, username, cash, sol_earned, xp, reputation, level, missions_completed)
VALUES
  ('DEMO_9xKj4mNp', 'CryptoKing_Sol', 250000, 2.45, 17640, 98500, 42, 312),
  ('DEMO_3aQr9sWt', 'NeonRider_X', 188000, 1.87, 14440, 87200, 38, 278),
  ('DEMO_7mHy2kLz', 'BlockBuster99', 145000, 1.23, 12250, 76500, 35, 234),
  ('DEMO_1pBn8vCq', 'SolStreetRacer', 122000, 0.95, 9610, 68900, 31, 198),
  ('DEMO_5dEr6fMu', 'ChainGang_Elite', 98500, 0.78, 7840, 54400, 28, 167),
  ('DEMO_2cFt1gNv', 'WalletHunter', 87300, 0.62, 6250, 48200, 25, 145),
  ('DEMO_8jKs5hOw', 'MiamiBoss', 72000, 0.48, 4840, 41500, 22, 122),
  ('DEMO_4lMt3iPx', 'SolanaGhost', 65000, 0.35, 3610, 35700, 19, 98),
  ('DEMO_6nNu7jQy', 'PixelThug', 54200, 0.22, 2890, 28900, 17, 82),
  ('DEMO_0oOv9kRz', 'CryptoSniper', 43800, 0.15, 1960, 22100, 14, 65)
ON CONFLICT (wallet_address) DO NOTHING;
