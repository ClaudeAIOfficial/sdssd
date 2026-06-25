insert into missions (
  id,
  title,
  type,
  district,
  briefing,
  objective,
  start_position,
  target_position,
  min_seconds,
  max_seconds,
  required_distance,
  rewards,
  sol_eligible,
  enabled
) values
(
  'seed-neon-drop',
  'Neon Drop',
  'delivery',
  'Neon Beach',
  'A beach vendor needs a sealed validator modem delivered before sunset.',
  'Drive from Volt Palm Gas to Airdrop Apartments.',
  array[-28, -22],
  array[-8, 18],
  14,
  150,
  34,
  '{"cash":450,"sol":0.004,"xp":80,"reputation":12}'::jsonb,
  true,
  true
),
(
  'seed-seafront-sprint',
  'Seafront Sprint',
  'race',
  'Neon Beach',
  'Race a street crew across the palm-lined loop without clipping traffic.',
  'Start at Validator Beach and finish at Lamport Park.',
  array[-36, 24],
  array[18, 26],
  10,
  95,
  48,
  '{"cash":720,"sol":0.003,"xp":110,"reputation":18}'::jsonb,
  true,
  true
),
(
  'seed-bodyguard-block',
  'Bodyguard Block',
  'protect',
  'Downtown',
  'Protect an NPC auditor walking from the bank to Civic Node PD.',
  'Escort the auditor without triggering more than two collisions.',
  array[8, 10],
  array[-28, 10],
  20,
  190,
  34,
  '{"cash":680,"sol":0.003,"xp":120,"reputation":20}'::jsonb,
  true,
  true
),
(
  'seed-founder-fare',
  'Founder Fare',
  'taxi',
  'Casino Row',
  'A builder leaving the casino needs a clean ride to the harbor launch.',
  'Pick up the founder at Mirage Byte Casino and reach Ledger Harbor.',
  array[28, 5],
  array[34, -28],
  12,
  130,
  28,
  '{"cash":380,"sol":0,"xp":70,"reputation":10}'::jsonb,
  false,
  true
) on conflict (id) do update set
  title = excluded.title,
  briefing = excluded.briefing,
  objective = excluded.objective,
  rewards = excluded.rewards,
  enabled = excluded.enabled;

insert into admin_logs (actor, action, details)
values ('seed', 'bootstrap', 'Grand Theft Solana seed missions installed.')
on conflict do nothing;
