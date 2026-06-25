# Grand Theft Solana (GTS)

An original open-world browser game inspired by classic top-down sandbox games, built on the Solana blockchain. Complete missions, build your empire, and earn real SOL.

## Features

- **Open World 3D City** — Low-poly Miami-inspired city built with React Three Fiber & Three.js
- **Mission System** — 8 mission types with dynamic generation, timers, and rewards
- **Economy** — In-game cash, XP, reputation, and on-chain SOL rewards
- **Wallet Integration** — Phantom, Backpack, Solflare support via Solana Wallet Adapter
- **Anti-Cheat** — Server-side mission verification, speed checks, timing validation
- **Character Customizer** — Skin tone, hair, clothes, shoes
- **Day/Night Cycle** — Dynamic lighting and sky
- **NPC AI** — Walking civilians, mission givers, gang members
- **Traffic System** — Animated vehicles patrolling streets
- **Minimap** — Real-time player and mission tracking
- **Phone UI** — In-game phone with Map, Missions, Leaderboard, Wallet, Settings
- **Wanted System** — 5-star wanted level
- **Leaderboard** — Top players by reputation, cash, SOL, and missions
- **Admin Panel** — Full management dashboard at `/admin`

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| 3D Engine | React Three Fiber, Three.js |
| State | Zustand |
| Blockchain | Solana Web3.js, Wallet Adapter |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Wallet-based (no passwords) |

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd grand-theft-solana
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
ADMIN_SECRET_KEY=change_this_in_production
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Copy your project URL and keys to `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Game Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Turn left |
| `D` / `→` | Turn right |
| `Shift` | Run |
| `E` | Interact with NPCs |
| `F` | Enter/exit vehicle |
| `P` | Open phone |
| `Space` | Jump |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with animated city |
| `/game` | Main 3D game |
| `/leaderboard` | Top players |
| `/admin` | Admin dashboard (password: `admin123` in demo) |

## Architecture

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── game/page.tsx     # Game page
│   ├── leaderboard/      # Leaderboard
│   ├── admin/            # Admin panel
│   └── api/              # Backend API routes
│       ├── player/       # Player CRUD
│       ├── missions/     # Mission verification
│       ├── rewards/      # SOL reward claiming
│       └── leaderboard/  # Leaderboard data
├── components/
│   ├── game/             # 3D game components
│   │   ├── City.tsx      # City buildings, roads, landmarks
│   │   ├── Player.tsx    # Player mesh + movement
│   │   ├── NPCs.tsx      # NPC characters
│   │   ├── Vehicles.tsx  # Drivable vehicles
│   │   └── MissionMarkers.tsx
│   ├── hud/              # Game UI overlay
│   │   ├── HUD.tsx       # Main HUD
│   │   ├── MiniMap.tsx   # Canvas minimap
│   │   ├── PhoneUI.tsx   # In-game phone
│   │   ├── MissionPanel.tsx
│   │   └── WantedStars.tsx
│   ├── landing/          # Homepage
│   └── ui/               # Shared UI components
├── store/
│   └── gameStore.ts      # Zustand global state
├── hooks/
│   ├── useKeyboard.ts    # Keyboard input
│   └── useGameLoop.ts    # Game loop hooks
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── missions.ts       # Mission generation
│   └── utils.ts          # Utilities
└── types/
    └── index.ts          # TypeScript types
```

## Anti-Cheat System

All SOL rewards are server-verified:

1. **Timing** — Minimum mission duration prevents instant completion
2. **Speed** — Maximum movement speed prevents teleportation cheats
3. **Deduplication** — Each mission can only be completed once per player
4. **Server-side** — Browser never generates or signs transactions
5. **Admin approval** — High-value rewards require admin sign-off
6. **Audit log** — All completions recorded with full telemetry

## Reward Flow

```
Player completes mission
       ↓
POST /api/missions/complete (server validates)
       ↓
POST /api/rewards/claim (server queues reward)
       ↓
Admin approves in dashboard
       ↓
Server wallet signs & sends SOL transaction
       ↓
Player's wallet receives SOL
```

## Expanding to Production

- Add real Solana transaction signing in `/api/rewards/claim/route.ts`
- Enable Supabase RLS policies for production security
- Deploy reward wallet with proper key management (HSM recommended)
- Add WebSocket support for real-time multiplayer via Supabase Realtime
- Implement NFT vehicle/property ownership on-chain
- Add PvP missions and events

## License

Original code and assets only. No GTA or Rockstar Games content.
