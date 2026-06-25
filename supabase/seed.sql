insert into players (wallet_address, username, cash, sol_balance, xp, reputation, missions_completed)
values
  ('DemoWallet1111111111111111111111111111111', 'NeonRunner', 8400, 0.132, 2120, 920, 26),
  ('DemoWallet2222222222222222222222222222222', 'HarborGhost', 6700, 0.089, 1810, 740, 21),
  ('DemoWallet3333333333333333333333333333333', 'BeachCipher', 5900, 0.071, 1640, 690, 18)
on conflict (wallet_address) do nothing;

insert into leaderboard (wallet_address, reputation, cash, sol_earned, missions_completed)
values
  ('DemoWallet1111111111111111111111111111111', 920, 8400, 0.132, 26),
  ('DemoWallet2222222222222222222222222222222', 740, 6700, 0.089, 21),
  ('DemoWallet3333333333333333333333333333333', 690, 5900, 0.071, 18)
on conflict (wallet_address) do nothing;

insert into inventory (wallet_address, item_type, quantity, metadata)
values
  ('DemoWallet1111111111111111111111111111111', 'phone', 1, '{"rarity":"starter"}'),
  ('DemoWallet1111111111111111111111111111111', 'crypto_wallet', 1, '{"model":"hardware"}'),
  ('DemoWallet2222222222222222222222222222222', 'backpack', 1, '{"capacity":"24"}'),
  ('DemoWallet3333333333333333333333333333333', 'food', 4, '{"energy":"+10"}');

