# Grand Theft Solana (GTS)

Grand Theft Solana is an original browser-based, top-down Web3 city sandbox MVP. Players connect a Solana wallet, enter a colorful low-poly coastal city, complete missions, earn in-game cash/XP/reputation, and queue verified SOL rewards through backend API routes.

The project is intentionally original: all gameplay, branding, visuals, and code are custom for this repository.

## Features

- Next.js, TypeScript, React, TailwindCSS, React Three Fiber, Three.js, Zustand, Framer Motion, Supabase, and Solana Wallet Adapter.
- Phantom, Backpack, and Solflare wallet support on Solana devnet by default.
- Animated landing page with city lights, traffic, helicopter motion, wallet connect, leaderboard, and admin entry.
- Playable low-poly city with streets, gas station, bank, casino, beach, harbor, apartments, police station, warehouse, park, traffic, NPC walkers, police units, palm trees, minimap, and day/night cycle.
- Character customization for hair, clothes, shoes, and skin tone.
- Walking, running, vehicle driving, building/NPC interaction, mission acceptance, mission completion, wanted stars, and synthesized audio.
- Phone UI opened with `P`: map, contacts, leaderboard, wallet, missions, and settings.
- Backend-verified reward flow:
  - API routes create players on first wallet connection.
  - Missions must be started server-side before completion.
  - Completion verifies timing, distance, start location, finish location, speed, collision limits, and duplicate reward claims.
  - SOL rewards are queued as pending records; browser code never creates payouts.
- Admin panel for reward approval, player bans, event spawning, logs, and economy controls.
- Supabase schema and seed data for production persistence.
- Local in-memory backend fallback so the game is playable immediately with one command before Supabase is configured.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The game runs locally without environment variables. Supabase-backed persistence and protected admin access are enabled by adding `.env.local` values.

## Controls

- `WASD` or arrow keys: move
- `Shift`: run on foot
- `E`: interact, accept nearby missions, complete missions at target markers, enter buildings, or enter a vehicle
- `Q`: exit vehicle
- `P`: phone

## Environment

Copy the template:

```bash
cp .env.example .env.local
```

Available variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
ADMIN_API_KEY=
```

- `SUPABASE_SERVICE_ROLE_KEY` is used only by server API routes.
- `ADMIN_API_KEY` protects `/api/admin` when set. The local demo leaves admin open if it is unset.
- `NEXT_PUBLIC_SOLANA_RPC_URL` defaults to Solana devnet.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`.
4. Add the Supabase URL, anon key, and service role key to `.env.local`.
5. Restart `npm run dev`.

Tables included:

- `players`
- `wallets`
- `missions`
- `rewards`
- `vehicles`
- `properties`
- `inventory`
- `leaderboard`
- `admin_logs`

## API routes

- `POST /api/player` - creates or loads a player for a wallet.
- `GET /api/missions` - returns enabled missions.
- `POST /api/mission/start` - marks a mission active for a wallet.
- `POST /api/mission/complete` - verifies telemetry and issues cash/XP/reputation plus pending SOL rewards.
- `POST /api/rewards/claim` - shows server-side pending SOL reward status.
- `GET /api/leaderboard` - returns top players.
- `GET /api/admin` and `POST /api/admin` - admin snapshot and actions.

## Anti-cheat model

The client records gameplay telemetry, but the API verifies all reward-generating completions:

- accepted mission exists
- duplicate reward not already issued
- elapsed time is within mission bounds
- route distance is plausible
- start and finish are near mission markers
- max speed stays within vehicle physics limits
- protection missions enforce collision limits

Real SOL payout should be performed only from a hardened server or operations workflow after admin approval.

## Production notes

- Replace the in-memory fallback with Supabase-only persistence before running public events.
- Keep payout signing keys out of the browser and out of Next public variables.
- Add rate limits and wallet signature challenge authentication for public deployment.
- Add observability around failed verification attempts and admin actions.
