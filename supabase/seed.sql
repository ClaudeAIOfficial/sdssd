-- Grand Theft Solana — seed data
-- Populates a few demo players + rewards so the leaderboard and admin panel are
-- not empty on a fresh deployment. Safe to run multiple times (uses upserts).

insert into public.players (id, wallet, handle, cash, sol, xp, level, reputation, missions_completed, appearance)
values
  ('pl_seed_neo',   'NeoVice1111111111111111111111111111111111', 'NeonNomad',  12450, 0.0420, 3200, 6, 188, 41, '{"skin":"#c68642","hair":"#22e3ff","hairStyle":"mohawk","shirt":"#ff2d95","pants":"#1a1a1a","shoes":"#ffffff","name":"NeonNomad"}'),
  ('pl_seed_lux',   'LuxDriftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',  'LuxDrift',    8800, 0.0310, 2400, 5, 142, 33, '{"skin":"#8d5524","hair":"#ffd23f","hairStyle":"afro","shirt":"#1be7b6","pants":"#22304a","shoes":"#0a0612","name":"LuxDrift"}'),
  ('pl_seed_riko',  'RikoWaveYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',  'RikoWave',    6100, 0.0185, 1500, 4, 97,  22, '{"skin":"#f6d3b0","hair":"#d916ff","hairStyle":"long","shirt":"#7b2ff7","pants":"#0a0612","shoes":"#ff2d95","name":"RikoWave"}'),
  ('pl_seed_zara',  'ZaraBlitzZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',  'ZaraBlitz',   4300, 0.0090, 900,  3, 64,  15, '{"skin":"#e8b58a","hair":"#1c1c1c","hairStyle":"short","shirt":"#ffd23f","pants":"#3b3b3b","shoes":"#22e3ff","name":"ZaraBlitz"}'),
  ('pl_seed_mav',   'MavSolXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',  'MavSol',      2100, 0.0030, 400,  2, 28,  7,  '{"skin":"#5a3a22","hair":"#b5651d","hairStyle":"buzz","shirt":"#22e3ff","pants":"#5a3a22","shoes":"#ffffff","name":"MavSol"}')
on conflict (id) do update set
  cash = excluded.cash,
  sol = excluded.sol,
  xp = excluded.xp,
  level = excluded.level,
  reputation = excluded.reputation,
  missions_completed = excluded.missions_completed;

insert into public.rewards (id, player_id, mission_id, cash, xp, reputation, sol, status, signature)
values
  ('rw_seed_1', 'pl_seed_neo', 'm_seed_1', 420, 90, 8, 0.0040, 'paid',     'demo-signature-neo'),
  ('rw_seed_2', 'pl_seed_lux', 'm_seed_2', 360, 70, 6, 0.0030, 'approved', null),
  ('rw_seed_3', 'pl_seed_riko','m_seed_3', 260, 60, 5, 0.0018, 'pending',  null)
on conflict (id) do nothing;

insert into public.admin_logs (id, action, detail)
values ('log_seed_1', 'seed', 'Seeded demo players and rewards')
on conflict (id) do nothing;
