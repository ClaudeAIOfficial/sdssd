import type { Mission, MissionReward, MissionType, Vec2 } from "./types";
import { ECONOMY } from "./constants";
import { LANDMARKS } from "./cityData";

// Simple deterministic-ish RNG helpers (Math.random based — purely cosmetic on
// the client; the backend independently recomputes expected reward bounds).
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randPoint(): Vec2 {
  const l = pick(LANDMARKS);
  return {
    x: l.pos.x + rand(-8, 8),
    z: l.pos.z + rand(-8, 8),
  };
}

const GIVERS = [
  "Tony 'Ledger' Marquez",
  "DJ Solstice",
  "Captain Mireles",
  "Anonymous Whale",
  "Coach Vega",
  "Mama Rosa",
  "The Validator",
  "Glitch",
];

interface MissionBlueprint {
  type: MissionType;
  title: string;
  describe: (giver: string) => string;
  baseCash: [number, number];
  baseXp: [number, number];
  baseRep: [number, number];
  verifiable: boolean;
  difficulty: [number, number];
  timeLimit: number;
}

const BLUEPRINTS: MissionBlueprint[] = [
  {
    type: "deliver_package",
    title: "Express Delivery",
    describe: (g) => `${g} needs a package dropped across town before it cools off.`,
    baseCash: [180, 360],
    baseXp: [40, 90],
    baseRep: [3, 7],
    verifiable: true,
    difficulty: [1, 2],
    timeLimit: 120,
  },
  {
    type: "taxi",
    title: "Late Night Fare",
    describe: (g) => `${g} flagged you down. Drop them at the marked spot, quick and smooth.`,
    baseCash: [120, 280],
    baseXp: [30, 70],
    baseRep: [2, 5],
    verifiable: true,
    difficulty: [1, 2],
    timeLimit: 140,
  },
  {
    type: "street_race",
    title: "Sunset Strip Race",
    describe: () => `Beat the rival to the harbor checkpoint. Winner takes the pot.`,
    baseCash: [400, 800],
    baseXp: [90, 160],
    baseRep: [6, 12],
    verifiable: true,
    difficulty: [2, 4],
    timeLimit: 95,
  },
  {
    type: "collect_wallets",
    title: "Loose Crypto Wallets",
    describe: () => `Hot wallets were dropped around the district. Scoop them before rivals do.`,
    baseCash: [220, 460],
    baseXp: [60, 120],
    baseRep: [4, 9],
    verifiable: true,
    difficulty: [2, 3],
    timeLimit: 150,
  },
  {
    type: "defeat_gang",
    title: "Clear the Corner",
    describe: () => `A gang is squatting the warehouse block. Run them off the corner.`,
    baseCash: [350, 700],
    baseXp: [100, 180],
    baseRep: [8, 15],
    verifiable: false,
    difficulty: [3, 5],
    timeLimit: 180,
  },
  {
    type: "protect_npc",
    title: "VIP Escort",
    describe: (g) => `Keep ${g} safe to the safehouse. No scratches.`,
    baseCash: [300, 560],
    baseXp: [80, 140],
    baseRep: [6, 11],
    verifiable: true,
    difficulty: [2, 4],
    timeLimit: 160,
  },
  {
    type: "steal_package",
    title: "Grab & Go",
    describe: () => `A crate is sitting unguarded at the docks. Lift it — expect heat.`,
    baseCash: [380, 720],
    baseXp: [90, 150],
    baseRep: [5, 10],
    verifiable: false,
    difficulty: [3, 5],
    timeLimit: 130,
  },
  {
    type: "find_hardware_wallet",
    title: "Lost Hardware Wallet",
    describe: (g) => `${g} lost a hardware wallet stuffed with SOL. Track it down for a real cut.`,
    baseCash: [260, 520],
    baseXp: [70, 130],
    baseRep: [5, 10],
    verifiable: true,
    difficulty: [2, 4],
    timeLimit: 170,
  },
];

function rollDifficulty([lo, hi]: [number, number]): number {
  return Math.round(rand(lo, hi));
}

/** Compute a reward given a blueprint and rolled difficulty. */
export function rewardFor(bp: MissionBlueprint, difficulty: number): MissionReward {
  const diffMul = 1 + (difficulty - 1) * 0.22;
  const cash = Math.round(rand(bp.baseCash[0], bp.baseCash[1]) * diffMul);
  const xp = Math.round(rand(bp.baseXp[0], bp.baseXp[1]) * diffMul);
  const reputation = Math.round(rand(bp.baseRep[0], bp.baseRep[1]) * diffMul);
  // SOL only on verifiable missions, scaled by difficulty and capped hard.
  const sol = bp.verifiable
    ? Math.min(
        ECONOMY.maxSolPerMission,
        Number((0.0008 * difficulty + rand(0, 0.0012)).toFixed(5)),
      )
    : 0;
  return { cash, xp, reputation, sol };
}

let counter = 0;
export function makeMissionId(): string {
  counter += 1;
  return `m_${Date.now().toString(36)}_${counter}_${Math.floor(Math.random() * 1e4).toString(36)}`;
}

/** Generate a single random mission. */
export function generateMission(): Mission {
  const bp = pick(BLUEPRINTS);
  const giver = pick(GIVERS);
  const difficulty = rollDifficulty(bp.difficulty);
  const origin = randPoint();
  let target = randPoint();
  // Ensure origin and target are not basically the same point.
  let guard = 0;
  while (Math.hypot(target.x - origin.x, target.z - origin.z) < 25 && guard < 6) {
    target = randPoint();
    guard += 1;
  }
  return {
    id: makeMissionId(),
    type: bp.type,
    title: bp.title,
    description: bp.describe(giver),
    giver,
    origin,
    target,
    reward: rewardFor(bp, difficulty),
    difficulty,
    timeLimit: bp.timeLimit,
    verifiable: bp.verifiable,
  };
}

export function generateMissions(count: number): Mission[] {
  return Array.from({ length: count }, () => generateMission());
}

/**
 * Backend-side reward bounds. Given a mission's declared metadata, return the
 * maximum plausible reward so the server can reject inflated client claims.
 * This is deliberately generous on cash/xp but strict on SOL.
 */
export function maxRewardBounds(type: MissionType, difficulty: number): MissionReward {
  const bp = BLUEPRINTS.find((b) => b.type === type);
  if (!bp) return { cash: 0, xp: 0, reputation: 0, sol: 0 };
  const diffMul = 1 + (difficulty - 1) * 0.22;
  // Add a 25% tolerance to absorb rounding/jitter on the client.
  const tol = 1.25;
  return {
    cash: Math.ceil(bp.baseCash[1] * diffMul * tol),
    xp: Math.ceil(bp.baseXp[1] * diffMul * tol),
    reputation: Math.ceil(bp.baseRep[1] * diffMul * tol),
    sol: bp.verifiable ? ECONOMY.maxSolPerMission : 0,
  };
}

export function missionTypeLabel(type: MissionType): string {
  const bp = BLUEPRINTS.find((b) => b.type === type);
  return bp?.title ?? type;
}
