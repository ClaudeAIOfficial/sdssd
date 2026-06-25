insert into vehicles (id, name, speed, handling, price, color) values
  ('sports', 'Solaris Sprint', 1.9, 1.55, 6000, '#ff4fd8'),
  ('motorcycle', 'Palm Runner', 2.1, 1.85, 3500, '#2de2e6'),
  ('van', 'Harbor Van', 1.25, 1.05, 2600, '#ffd166'),
  ('truck', 'Dock Titan', 1.05, 0.9, 4800, '#f97316'),
  ('electric', 'Volt Coupe', 1.7, 1.65, 5200, '#14f195')
on conflict (id) do update set
  name = excluded.name,
  speed = excluded.speed,
  handling = excluded.handling,
  price = excluded.price,
  color = excluded.color;

insert into missions (
  id,
  title,
  kind,
  district,
  description,
  target,
  distance_required,
  min_duration_seconds,
  reward_cash,
  reward_sol,
  reward_xp,
  reward_reputation,
  sol_reward_eligible
) values
  ('mission-delivery-harbor', 'Harbor Handshake', 'delivery', 'Harbor', 'Move an encrypted package from the apartments to the harbor broker.', array[24, -18], 54, 22, 450, 0, 90, 12, false),
  ('mission-taxi-strip', 'Neon Taxi Run', 'taxi', 'Casino Strip', 'Pick up a synthwave DJ and get them to the casino before the show.', array[18, -6], 45, 18, 520, 0, 80, 10, false),
  ('mission-race-beach', 'Palm Circuit', 'race', 'Neon Beach', 'Hit the coastal checkpoints with clean driving and no shortcuts.', array[-24, -18], 72, 28, 900, 0.002, 150, 24, true),
  ('mission-wallet-park', 'Lost Hardware Wallet', 'recovery', 'Palm Park', 'Search Palm Park for a misplaced hardware wallet before scavengers find it.', array[-19, 11], 36, 16, 380, 0.001, 70, 14, true),
  ('mission-collect-keys', 'Hidden Seed Phrases', 'collect', 'Financial', 'Collect four paper wallet fragments around the bank district.', array[10, 9], 50, 24, 650, 0, 130, 18, false),
  ('mission-escort-civic', 'Validator Escort', 'escort', 'Civic', 'Protect a validator engineer while they reaches the police station.', array[18, 16], 48, 25, 780, 0.0015, 140, 20, true),
  ('mission-heist-warehouse', 'Warehouse Intercept', 'heist', 'Old Warehouse', 'Steal a package from a rival crew and drop it at the garage.', array[3, -15], 66, 30, 1100, 0, 180, 30, false),
  ('mission-combat-bank', 'Bank Blockade', 'combat', 'Financial', 'Defeat the NPC gang blocking the Sol Bank service entrance.', array[10, 9], 28, 14, 720, 0.0025, 160, 26, true)
on conflict (id) do update set
  title = excluded.title,
  kind = excluded.kind,
  district = excluded.district,
  description = excluded.description,
  target = excluded.target,
  distance_required = excluded.distance_required,
  min_duration_seconds = excluded.min_duration_seconds,
  reward_cash = excluded.reward_cash,
  reward_sol = excluded.reward_sol,
  reward_xp = excluded.reward_xp,
  reward_reputation = excluded.reward_reputation,
  sol_reward_eligible = excluded.sol_reward_eligible;

insert into players (
  id,
  handle,
  wallet_address,
  cosmetics,
  cash,
  sol_earned,
  xp,
  reputation,
  owned_vehicles,
  inventory,
  completed_missions
) values
  ('seed-novadock', 'NovaDock', 'SeedNovaDock111111111111111111111111111111', '{"hair":"#161223","clothes":"#14f195","shoes":"#ffffff","skinTone":"#b87850"}', 12800, 0.024, 2140, 420, array['electric','sports'], '[]', array['mission-delivery-harbor','mission-race-beach']),
  ('seed-palmbyte', 'PalmByte', 'SeedPalmByte11111111111111111111111111111', '{"hair":"#5a2d0c","clothes":"#9945ff","shoes":"#ffb000","skinTone":"#d6a06d"}', 10300, 0.018, 1840, 370, array['electric','motorcycle'], '[]', array['mission-wallet-park'])
on conflict (wallet_address) do nothing;

insert into leaderboard (player_id, reputation, cash, sol_earned, missions)
select id, reputation, cash, sol_earned, cardinality(completed_missions)
from players
on conflict (player_id) do update set
  reputation = excluded.reputation,
  cash = excluded.cash,
  sol_earned = excluded.sol_earned,
  missions = excluded.missions,
  updated_at = now();
