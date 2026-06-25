# Grand Theft Solana (GTS)

Grand Theft Solana is an original browser-based, low-poly Web3 sandbox MVP inspired by classic top-down mission games. It uses original procedural assets, typed game systems, wallet login, server-verified missions, and Supabase-ready persistence.

## Features

- Animated landing page with moving city ambience and wallet CTA.
- Playable low-poly city with streets, beach, harbor, bank, casino, gas station, apartments, police station, warehouse, park, and garage.
- Keyboard gameplay: walk, run, drive vehicles, open phone, trigger crimes, accept and complete missions.
- Customizable character hair, clothes, shoes, and skin tone.
- Vehicles: sports car, motorcycle, van, truck, and electric car with different speed/handling/economy.
- NPCs, traffic, day/night cycle, mission markers, and dynamic police spawns from wanted stars.
- Phone UI with map, contacts, leaderboard, wallet, missions, garage, and settings.
- Wallet support for Phantom, Backpack, and Solflare through Solana Wallet Adapter.
- Backend mission verification for travel distance, timing, speed limits, objective proximity, duplicate claims, and banned players.
- Supabase schema and seed data for players, wallets, missions, rewards, vehicles, properties, inventory, leaderboard, admin logs, and reward claims.
- Admin tools for event spawning, economy tuning, reward review actions, and log visibility.

## Tech stack

Next.js, TypeScript, React, TailwindCSS, React Three Fiber, Three.js, Zustand, Framer Motion, Supabase, Solana Wallet Adapter, Phantom/Backpack/Solflare wallet adapters, and Node.js API routes.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app runs without Supabase credentials by using local seed data. Add Supabase variables to persist accounts, verified mission rewards, reward claims, and admin logs.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`.
4. Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
ADMIN_PASSCODE=your-server-admin-passcode
NEXT_PUBLIC_ADMIN_PASSCODE=your-local-admin-ui-passcode
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-side. Mission rewards are verified and written from API routes only.

## Controls

- `WASD` / arrow keys: move
- `Shift`: run
- `E`: enter or exit the selected vehicle
- `P`: open phone
- `X`: trigger a crime and increase wanted stars

## Gameplay loop

1. Connect a Solana wallet or play as a guest.
2. Accept a mission from the HUD, NPC contacts, or phone missions app.
3. Travel through the city to the objective marker.
4. Meet timing, distance, speed, and proximity checks.
5. Press **Verify completion** to request server verification.
6. Approved rewards update cash, XP, reputation, and eligible in-game SOL balance.
7. Use cash for vehicles and keep building reputation for leaderboard placement.

## Reward security model

The browser cannot create real rewards. It submits a mission attempt to `/api/missions/verify`, and the server validates:

- Known mission ID
- Duplicate reward claims
- Minimum mission duration
- Required travel distance
- Maximum movement speed
- Objective proximity
- Banned player status when Supabase is enabled

SOL rewards are recorded as pending review rows. Real payouts should be performed by an admin-controlled backend worker or treasury service after reviewing `reward_claims`; client-side payout signing is intentionally not implemented.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run build
```
