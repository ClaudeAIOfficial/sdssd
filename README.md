# 🌴 Grand Theft Solana (GTS)

> Complete missions. Build your empire. **Earn SOL.**

Grand Theft Solana is an **original**, top-down, open-world Web3 browser game set
in a neon Miami-style city. Drive, walk, run, take on randomly generated
missions, dodge the police, climb the leaderboards — and earn small amounts of
**real SOL** through backend-verified missions.

GTS is a fully original game. It is **not** affiliated with, endorsed by, or
derived from any existing game franchise. All assets, branding, geometry, and
code are original and generated procedurally.

---

## ✨ Features

- **Living low-poly city** — streets on a grid, original buildings, gas station,
  bank, casino, beach, harbor, apartments, police station, warehouse, park,
  garage and a safehouse. Cars driving around, NPCs walking, full day/night cycle.
- **Drive 5 vehicle types** — sports car, motorcycle, van, truck, electric car,
  each with simple arcade physics.
- **Randomly generated missions** — deliveries, taxi fares, street races, wallet
  collection, gang clears, VIP escorts, heists and lost-hardware-wallet hunts.
- **Police & wanted system** — 1–5 stars, dynamically spawning cops that chase
  you, and a cool-down to lose heat by escaping.
- **Economy** — Cash, SOL, XP and Reputation. Cash buys snacks, apartments and
  vehicle summons; SOL is earned **only** through verified missions.
- **Character customization** — skin tone, hair style + color, shirt, pants, shoes,
  with a live 3D preview.
- **Phone UI (press P)** — Map, Contacts, Leaderboard, Wallet, Missions, Settings.
- **Inventory (press I)**, **full-screen map (press M)**, live **minimap**.
- **Wallet integration** — Phantom, Backpack & Solflare via the Solana Wallet
  Adapter. First connection auto-creates a player account.
- **Backend-verified rewards / anti-cheat** — the browser can never mint rewards.
  Mission completion is validated server-side (timing, distance, impossible
  movement, duplicate-reward guards) and clamped to server-computed bounds.
- **Leaderboards** — Top Reputation, Cash, SOL Earned and Missions.
- **Admin control room (`/admin`)** — approve/reject SOL rewards, ban players,
  spawn events, tune the economy, generate missions, view audit logs.
- **Glassmorphism AAA-inspired UI** with smooth Framer Motion animations,
  dark neon theme, responsive layout.

---

## 🧰 Tech Stack

Next.js (App Router) · TypeScript · React · TailwindCSS · React Three Fiber ·
Three.js · Zustand · Framer Motion · Supabase · Solana Wallet Adapter
(Phantom / Backpack / Solflare) · Node.js API routes.

---

## 🚀 Quick Start (one command)

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

That's it. **No database or environment setup is required** — GTS ships with an
in-memory data layer so everything (player accounts, missions, rewards,
leaderboard, admin panel) works immediately for local development.

### Build for production

```bash
npm run build
npm start
```

---

## 🔌 Optional: enable Supabase persistence

By default GTS uses an in-memory store (data resets on server restart). To make
players, rewards and leaderboards persistent and shared across users:

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) and
   (optionally) [`supabase/seed.sql`](supabase/seed.sql).
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — used by the API routes)
4. Restart `npm run dev`. The app auto-detects the credentials and switches to
   Supabase.

---

## 🎮 Controls

| Key | Action |
| --- | --- |
| `W` `A` `S` `D` / Arrows | Move |
| `Shift` | Sprint |
| `F` | Enter / exit nearest vehicle |
| `E` | Interact with / enter a nearby building |
| `P` | Open phone |
| `M` | Open full-screen map |
| `I` | Open inventory |
| `Esc` | Close any panel |

---

## 🗺️ Project structure

```
src/
  app/
    page.tsx               Animated landing page
    play/page.tsx          The game (3D world + HUD)
    leaderboard/page.tsx   Public leaderboards
    admin/page.tsx         Admin control room
    api/                   Node API routes
      player/              Get/create/update players (sign-up on wallet connect)
      missions/            Generate missions + verified completion endpoint
      rewards/claim/       Claim flow + transaction history (never client-signed)
      leaderboard/         Aggregated rankings
      admin/               Admin actions (auth via passphrase)
  components/
    providers/             Wallet + app providers
    landing/               Animated city backdrop
    game/                  React Three Fiber world (city, actors, vehicles, FX)
    hud/                   HUD, minimap, phone, inventory, wallet, modals
    character/             Character creator
    wallet/                Wallet button + player sync hook
  game/                    Pure simulation (world state, physics, city layout)
  lib/                     Types, store (Zustand), economy, missions, db, anti-cheat
supabase/
  schema.sql               Database schema
  seed.sql                 Demo seed data
```

---

## 🛡️ Anti-cheat & reward integrity

All rewards are awarded by the server in `POST /api/missions/complete`:

- **Timing checks** — rejects impossibly fast or expired completions.
- **Distance checks** — travelled distance must be consistent with the objective.
- **Impossible-movement checks** — average speed can't exceed the fastest vehicle.
- **Duplicate-reward guard** — the same player+mission can't be paid twice.
- **Server-side clamping** — declared rewards are clamped to bounds recomputed on
  the server; the client cannot inflate payouts.
- **SOL is never paid client-side** — verified SOL rewards are recorded as
  `pending`, approved via the admin panel, and queued for treasury settlement.

---

## 🔐 Admin panel

Visit `/admin`. The default development passphrase is `gts-admin`
(override with the `ADMIN_PASSWORD` environment variable). From there you can
approve/reject/settle SOL rewards, ban or unban players, spawn live events,
tune cash/SOL multipliers, generate missions and read the audit log.

---

## 🧱 Production notes / future expansion

This MVP is architected to grow into a larger online game:

- Pure, framework-agnostic simulation in `src/game` (easy to move authoritative
  movement server-side or into a worker for multiplayer).
- A swappable data layer (`src/lib/db.ts`) already abstracts Supabase vs memory.
- A clean reward pipeline (`pending → approved → paid`) ready for a real treasury
  signer / on-chain program.

Have fun, and drive safe out there. 🏎️💨
