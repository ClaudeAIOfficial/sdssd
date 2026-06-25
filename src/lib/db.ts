// Server-side data layer for GTS.
//
// The game is designed to run with ZERO configuration: if Supabase env vars are
// present we use Supabase, otherwise we transparently fall back to an in-memory
// store so `npm run dev` works out of the box. The SQL schema for Supabase lives
// in `supabase/schema.sql`.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminLog,
  LeaderboardRow,
  PlayerProfile,
  RewardRecord,
} from "./types";
import { ECONOMY } from "./constants";
import { defaultAppearance } from "./appearance";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export function usingSupabase(): boolean {
  return supabase !== null;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

interface MemoryDB {
  players: Map<string, PlayerProfile & { banned: boolean }>;
  rewards: RewardRecord[];
  logs: AdminLog[];
  economy: { cashMultiplier: number; solMultiplier: number };
}

// Persist across hot reloads in dev by stashing on globalThis.
const g = globalThis as unknown as { __gtsdb?: MemoryDB };
const mem: MemoryDB =
  g.__gtsdb ??
  (g.__gtsdb = {
    players: new Map(),
    rewards: [],
    logs: [],
    economy: { cashMultiplier: 1, solMultiplier: 1 },
  });

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function handleFromWallet(wallet: string | null): string {
  if (!wallet) return `Guest-${Math.floor(Math.random() * 9999)}`;
  return `Player-${wallet.slice(0, 4)}${wallet.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getOrCreatePlayer(
  wallet: string | null,
  handle?: string,
): Promise<PlayerProfile> {
  if (supabase) {
    if (wallet) {
      const { data: existing } = await supabase
        .from("players")
        .select("*")
        .eq("wallet", wallet)
        .maybeSingle();
      if (existing) return rowToProfile(existing);
    }
    const profile = baseProfile(wallet, handle);
    const { data, error } = await supabase
      .from("players")
      .insert(profileToRow(profile))
      .select("*")
      .single();
    if (error) throw error;
    return rowToProfile(data);
  }

  // Memory mode
  if (wallet) {
    for (const p of mem.players.values()) {
      if (p.wallet === wallet) return strip(p);
    }
  }
  const profile = { ...baseProfile(wallet, handle), banned: false };
  mem.players.set(profile.id, profile);
  return strip(profile);
}

export async function getPlayer(id: string): Promise<PlayerProfile | null> {
  if (supabase) {
    const { data } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
    return data ? rowToProfile(data) : null;
  }
  const p = mem.players.get(id);
  return p ? strip(p) : null;
}

export async function updatePlayer(
  id: string,
  patch: Partial<PlayerProfile>,
): Promise<PlayerProfile | null> {
  if (supabase) {
    const { data } = await supabase
      .from("players")
      .update(profilePatchToRow(patch))
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? rowToProfile(data) : null;
  }
  const p = mem.players.get(id);
  if (!p) return null;
  Object.assign(p, patch);
  return strip(p);
}

export async function isBanned(id: string): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase.from("players").select("banned").eq("id", id).maybeSingle();
    return Boolean(data?.banned);
  }
  return Boolean(mem.players.get(id)?.banned);
}

export async function setBanned(id: string, banned: boolean): Promise<void> {
  if (supabase) {
    await supabase.from("players").update({ banned }).eq("id", id);
    return;
  }
  const p = mem.players.get(id);
  if (p) p.banned = banned;
}

export async function recordReward(reward: Omit<RewardRecord, "id" | "createdAt">): Promise<RewardRecord> {
  const full: RewardRecord = {
    ...reward,
    id: newId("rw"),
    createdAt: new Date().toISOString(),
  };
  if (supabase) {
    const { data, error } = await supabase
      .from("rewards")
      .insert({
        id: full.id,
        player_id: full.playerId,
        mission_id: full.missionId,
        cash: full.cash,
        xp: full.xp,
        reputation: full.reputation,
        sol: full.sol,
        status: full.status,
        signature: full.signature,
        created_at: full.createdAt,
      })
      .select("*")
      .single();
    if (error) throw error;
    return rowToReward(data);
  }
  mem.rewards.unshift(full);
  return full;
}

export async function getRewards(playerId: string): Promise<RewardRecord[]> {
  if (supabase) {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(rowToReward);
  }
  return mem.rewards.filter((r) => r.playerId === playerId).slice(0, 50);
}

export async function getPendingRewards(): Promise<RewardRecord[]> {
  if (supabase) {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map(rowToReward);
  }
  return mem.rewards.filter((r) => r.status === "pending");
}

export async function updateRewardStatus(
  id: string,
  status: RewardRecord["status"],
  signature?: string,
): Promise<void> {
  if (supabase) {
    await supabase.from("rewards").update({ status, signature: signature ?? null }).eq("id", id);
    return;
  }
  const r = mem.rewards.find((x) => x.id === id);
  if (r) {
    r.status = status;
    if (signature) r.signature = signature;
  }
}

export async function getLeaderboard(): Promise<{
  topReputation: LeaderboardRow[];
  topCash: LeaderboardRow[];
  topSol: LeaderboardRow[];
  topMissions: LeaderboardRow[];
}> {
  let rows: LeaderboardRow[];
  if (supabase) {
    const { data } = await supabase.from("players").select("*").limit(500);
    rows = (data ?? []).map((d) => ({
      handle: d.handle,
      wallet: d.wallet,
      reputation: d.reputation,
      cash: d.cash,
      solEarned: Number(d.sol),
      missionsCompleted: d.missions_completed,
    }));
  } else {
    rows = Array.from(mem.players.values())
      .filter((p) => !p.banned)
      .map((p) => ({
        handle: p.handle,
        wallet: p.wallet,
        reputation: p.reputation,
        cash: p.cash,
        solEarned: p.sol,
        missionsCompleted: p.missionsCompleted,
      }));
  }
  const top = (key: keyof LeaderboardRow) =>
    [...rows].sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, 10);
  return {
    topReputation: top("reputation"),
    topCash: top("cash"),
    topSol: top("solEarned"),
    topMissions: top("missionsCompleted"),
  };
}

export async function addAdminLog(action: string, detail: string): Promise<void> {
  const log: AdminLog = {
    id: newId("log"),
    action,
    detail,
    createdAt: new Date().toISOString(),
  };
  if (supabase) {
    await supabase.from("admin_logs").insert({
      id: log.id,
      action: log.action,
      detail: log.detail,
      created_at: log.createdAt,
    });
    return;
  }
  mem.logs.unshift(log);
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  if (supabase) {
    const { data } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((d) => ({
      id: d.id,
      action: d.action,
      detail: d.detail,
      createdAt: d.created_at,
    }));
  }
  return mem.logs.slice(0, 100);
}

export function getEconomy() {
  return mem.economy;
}
export function setEconomy(patch: Partial<MemoryDB["economy"]>) {
  Object.assign(mem.economy, patch);
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

function baseProfile(wallet: string | null, handle?: string): PlayerProfile {
  return {
    id: newId("pl"),
    wallet,
    handle: handle || handleFromWallet(wallet),
    cash: ECONOMY.startingCash,
    sol: ECONOMY.startingSol,
    xp: 0,
    level: 1,
    reputation: 0,
    missionsCompleted: 0,
    appearance: defaultAppearance(),
    createdAt: new Date().toISOString(),
  };
}

function strip(p: PlayerProfile & { banned: boolean }): PlayerProfile {
  const { banned: _banned, ...rest } = p;
  return rest;
}

function rowToProfile(d: Record<string, unknown>): PlayerProfile {
  return {
    id: d.id as string,
    wallet: (d.wallet as string) ?? null,
    handle: d.handle as string,
    cash: Number(d.cash),
    sol: Number(d.sol),
    xp: Number(d.xp),
    level: Number(d.level),
    reputation: Number(d.reputation),
    missionsCompleted: Number(d.missions_completed),
    appearance: (d.appearance as PlayerProfile["appearance"]) ?? defaultAppearance(),
    createdAt: (d.created_at as string) ?? new Date().toISOString(),
  };
}

function profileToRow(p: PlayerProfile) {
  return {
    id: p.id,
    wallet: p.wallet,
    handle: p.handle,
    cash: p.cash,
    sol: p.sol,
    xp: p.xp,
    level: p.level,
    reputation: p.reputation,
    missions_completed: p.missionsCompleted,
    appearance: p.appearance,
    created_at: p.createdAt,
    banned: false,
  };
}

function profilePatchToRow(p: Partial<PlayerProfile>) {
  const row: Record<string, unknown> = {};
  if (p.handle !== undefined) row.handle = p.handle;
  if (p.cash !== undefined) row.cash = p.cash;
  if (p.sol !== undefined) row.sol = p.sol;
  if (p.xp !== undefined) row.xp = p.xp;
  if (p.level !== undefined) row.level = p.level;
  if (p.reputation !== undefined) row.reputation = p.reputation;
  if (p.missionsCompleted !== undefined) row.missions_completed = p.missionsCompleted;
  if (p.appearance !== undefined) row.appearance = p.appearance;
  return row;
}

function rowToReward(d: Record<string, unknown>): RewardRecord {
  return {
    id: d.id as string,
    playerId: d.player_id as string,
    missionId: d.mission_id as string,
    cash: Number(d.cash),
    xp: Number(d.xp),
    reputation: Number(d.reputation),
    sol: Number(d.sol),
    status: d.status as RewardRecord["status"],
    signature: (d.signature as string) ?? null,
    createdAt: (d.created_at as string) ?? new Date().toISOString(),
  };
}
