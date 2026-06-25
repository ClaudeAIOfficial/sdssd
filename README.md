# Grand Theft Solana (GTS)

Grand Theft Solana is an original top-down open-world browser game MVP built with Next.js + React Three Fiber.

Players can:

- Explore a neon low-poly city (roads, bank, casino, beach, harbor, apartments, police station, warehouse, park, gas station, garage, safehouse)
- Walk/run, drive multiple vehicle classes, enter buildings, talk to NPCs, and trigger crimes
- Accept and complete generated missions for cash, XP, reputation, and occasionally SOL
- Connect Solana wallets (Phantom, Backpack, Solflare)
- Claim backend-verified SOL rewards (never client-trusted)
- Use an in-game phone UI (Map, Contacts, Leaderboard, Wallet, Missions, Settings)
- View mini-map + mission markers + wanted level + inventory
- Access a working admin panel for mission/economy/live-event operations

> This project is inspired by sandbox mission gameplay and contains only original code/content.

---

## Tech Stack

- Next.js (App Router) + TypeScript
- React + TailwindCSS + Framer Motion
- Three.js + React Three Fiber + Drei
- Zustand for gameplay state
- Supabase (or automatic demo fallback mode)
- Solana Wallet Adapter (Phantom, Backpack, Solflare)
- Node API routes for anti-cheat verification and reward claiming

---

## Run Locally (One Command)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env template:

   ```bash
   cp .env.example .env.local
   ```

3. Start:

   ```bash
   npm run dev
   ```

Open http://localhost:3000

If Supabase is not configured, the game runs in **demo mode** with an in-memory backend and still provides a full playable loop.

---

## Environment Variables

See `.env.example`:

- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana endpoint (Devnet default recommended)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service role key for server verification routes
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`: admin panel credentials
- `ADMIN_JWT_SECRET`: admin route signing secret

---

## Supabase Setup

1. Create a new Supabase project.
2. Run SQL schema:
   - `supabase/schema.sql`
3. Seed starter data:
   - `supabase/seed.sql`

The schema includes:

- `players`
- `wallets`
- `missions`
- `rewards`
- `vehicles`
- `properties`
- `inventory`
- `leaderboard`
- `admin_logs`

And a server-side reward function:

- `apply_player_reward(...)`

---

## Gameplay Controls

- `WASD` move
- `Shift` run / vehicle boost
- `E` interact (enter/exit buildings, talk)
- `F` enter/exit nearest vehicle
- `T` talk to nearby NPC
- `C` trigger crime (increases wanted stars)
- `P` open phone

---

## Backend Verification & Anti-Cheat

Mission reward issuance is API-verified:

- Route: `POST /api/missions/verify`
- Validates:
  - Mission timing bounds
  - Average speed limits
  - Telemetry consistency (distance/path checks)
  - Duplicate mission runs
- Rewards are created server-side only

SOL claims are separate:

- Route: `POST /api/rewards/claim`
- Requires matching wallet + reward ownership
- Prevents duplicate claims

Leaderboard:

- Route: `GET /api/leaderboard`

Wallet transaction history:

- Route: `GET /api/rewards/history?wallet=<address>`

---

## Admin Panel

Path: `/admin`

Features:

- Admin login
- Create missions
- Approve rewards
- Ban players
- Spawn live events
- Change economy parameters
- View admin logs

Routes:

- `POST /api/admin/login`
- `GET /api/admin/actions`
- `POST /api/admin/actions`

---

## Project Structure

```text
src/
  app/
    api/...
    admin/page.tsx
    page.tsx
  components/
    game/...
    providers/...
  lib/
    constants.ts
    types.ts
    utils.ts
    demo-db.ts
    supabase.ts
    admin-auth.ts
  store/
    game-store.ts
supabase/
  schema.sql
  seed.sql
```

---

## Scripts

- `npm run dev` – start local dev server
- `npm run lint` – run ESLint
- `npm run build` – production build/typecheck
- `npm run start` – start production server

