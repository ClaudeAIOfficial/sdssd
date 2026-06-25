// Shared domain types for Grand Theft Solana (GTS).
// These types are used across the client game, the Zustand store and the
// backend API routes so that the contract stays consistent end to end.

export type Vec2 = { x: number; z: number };

export type MissionType =
  | "deliver_package"
  | "taxi"
  | "street_race"
  | "collect_wallets"
  | "defeat_gang"
  | "protect_npc"
  | "steal_package"
  | "find_hardware_wallet";

export interface MissionReward {
  cash: number;
  xp: number;
  reputation: number;
  /** SOL is only ever awarded by the backend after verification. */
  sol: number;
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  giver: string;
  /** World location where the mission is accepted. */
  origin: Vec2;
  /** World location the player must reach / interact with. */
  target: Vec2;
  reward: MissionReward;
  /** Difficulty 1-5, influences rewards and police heat. */
  difficulty: number;
  /** Soft time limit in seconds for anti-cheat timing checks. */
  timeLimit: number;
  /** Whether this mission can pay out SOL (verified missions only). */
  verifiable: boolean;
}

export interface CharacterAppearance {
  skin: string;
  hair: string;
  hairStyle: "buzz" | "short" | "afro" | "mohawk" | "long";
  shirt: string;
  pants: string;
  shoes: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  qty: number;
  kind: "phone" | "backpack" | "wallet" | "keys" | "mission" | "food";
  description: string;
}

export interface PlayerProfile {
  id: string;
  wallet: string | null;
  handle: string;
  cash: number;
  sol: number;
  xp: number;
  level: number;
  reputation: number;
  missionsCompleted: number;
  appearance: CharacterAppearance;
  createdAt: string;
}

export interface LeaderboardRow {
  handle: string;
  wallet: string | null;
  reputation: number;
  cash: number;
  solEarned: number;
  missionsCompleted: number;
}

export interface RewardRecord {
  id: string;
  playerId: string;
  missionId: string;
  cash: number;
  xp: number;
  reputation: number;
  sol: number;
  status: "pending" | "approved" | "rejected" | "paid";
  signature: string | null;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
}

/** Telemetry sent with a mission completion for backend anti-cheat checks. */
export interface MissionCompletionPayload {
  playerId: string;
  wallet: string | null;
  missionId: string;
  missionType: MissionType;
  difficulty: number;
  startedAt: number;
  finishedAt: number;
  distanceTravelled: number;
  origin: Vec2;
  target: Vec2;
  declaredReward: MissionReward;
}

export interface MissionCompletionResult {
  ok: boolean;
  reason?: string;
  granted?: MissionReward;
  reward?: RewardRecord;
}
