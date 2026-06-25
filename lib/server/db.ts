import "server-only";

import { randomUUID } from "crypto";
import { verifyMissionCompletion } from "@/lib/antiCheat";
import { defaultCharacter, generateMissions, starterInventory, vehicleCatalog } from "@/lib/gameData";
import { getServerSupabase } from "@/lib/supabase";
import type {
  ActiveMission,
  AdminLog,
  LeaderboardEntry,
  Mission,
  MissionTelemetry,
  Player,
  RewardRecord,
} from "@/lib/types";

type CompleteMissionResult =
  | { ok: true; player: Player; reward: RewardRecord; verification: ReturnType<typeof verifyMissionCompletion> }
  | { ok: false; status: number; error: string; reasons?: string[] };

type AdminAction =
  | { type: "approveReward"; rewardId: string; actor: string }
  | { type: "banPlayer"; playerId: string; actor: string; banned: boolean }
  | { type: "spawnEvent"; actor: string; name: string; district: string }
  | { type: "changeEconomy"; actor: string; cashMultiplier: number; solEnabled: boolean }
  | { type: "createMission"; actor: string; mission: Mission };

const localPlayers = new Map<string, Player>();
const activeMissions = new Map<string, ActiveMission>();
const localRewards = new Map<string, RewardRecord>();
const adminLogs: AdminLog[] = [];
const createdMissions: Mission[] = [];
const economy = { cashMultiplier: 1, solEnabled: true };

function dailySeed() {
  const now = new Date();
  return Number(`${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`);
}

function walletKey(walletAddress: string) {
  return walletAddress.trim();
}

function publicWallet(walletAddress: string) {
  if (walletAddress.length < 10) return walletAddress;
  return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
}

function makePlayer(walletAddress: string): Player {
  return {
    id: randomUUID(),
    walletAddress,
    handle: `Driver ${publicWallet(walletAddress)}`,
    createdAt: new Date().toISOString(),
    currencies: { cash: 1250, sol: 0, xp: 0, reputation: 0 },
    character: defaultCharacter,
    inventory: starterInventory,
    vehicles: vehicleCatalog,
    wantedStars: 0,
    banned: false,
    missionsCompleted: 0,
  };
}

function addAdminLog(actor: string, action: string, details: string) {
  adminLogs.unshift({
    id: randomUUID(),
    actor,
    action,
    details,
    createdAt: new Date().toISOString(),
  });
  adminLogs.splice(80);
}

function activeKey(playerId: string, missionId: string) {
  return `${playerId}:${missionId}`;
}

export async function getOrCreatePlayer(walletAddress: string) {
  const supabase = getServerSupabase();
  const key = walletKey(walletAddress);

  if (supabase) {
    const { data: existing, error } = await supabase.from("players").select("*").eq("wallet_address", key).maybeSingle();
    if (error) throw error;
    if (existing) return fromPlayerRow(existing);

    const player = makePlayer(key);
    const { data, error: insertError } = await supabase
      .from("players")
      .insert(toPlayerRow(player))
      .select("*")
      .single();
    if (insertError) throw insertError;
    return fromPlayerRow(data);
  }

  const existing = localPlayers.get(key);
  if (existing) return existing;
  const player = makePlayer(key);
  localPlayers.set(key, player);
  return player;
}

export async function getMissions() {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data } = await supabase.from("missions").select("*").eq("enabled", true).order("created_at", { ascending: false }).limit(12);
    if (data?.length) return data.map(fromMissionRow);
  }
  return [...createdMissions, ...generateMissions(dailySeed())];
}

export async function startMission(walletAddress: string, missionId: string) {
  const player = await getOrCreatePlayer(walletAddress);
  if (player.banned) return { ok: false as const, status: 403, error: "Player account is banned." };
  const mission = (await getMissions()).find((item) => item.id === missionId);
  if (!mission) return { ok: false as const, status: 404, error: "Mission not found." };

  const active: ActiveMission = {
    ...mission,
    status: "active",
    acceptedAt: Date.now(),
    distanceTravelled: 0,
  };
  activeMissions.set(activeKey(player.id, mission.id), active);
  return { ok: true as const, player, mission: active };
}

export async function completeMission(telemetry: MissionTelemetry): Promise<CompleteMissionResult> {
  const player = await getOrCreatePlayer(telemetry.walletAddress);
  const mission = (await getMissions()).find((item) => item.id === telemetry.missionId);
  if (!mission) return { ok: false, status: 404, error: "Mission not found." };
  if (player.banned) return { ok: false, status: 403, error: "Player account is banned." };

  const key = activeKey(player.id, mission.id);
  if (!activeMissions.has(key)) {
    return { ok: false, status: 409, error: "Mission must be accepted before completion." };
  }

  const duplicate = [...localRewards.values()].some((reward) => reward.playerId === player.id && reward.missionId === mission.id);
  if (duplicate) {
    return { ok: false, status: 409, error: "Mission reward has already been issued." };
  }

  const verification = verifyMissionCompletion(mission, telemetry);
  if (!verification.valid) {
    return { ok: false, status: 422, error: "Mission verification failed.", reasons: verification.reasons };
  }

  const sol = mission.solEligible && economy.solEnabled ? mission.rewards.sol : 0;
  const reward: RewardRecord = {
    id: randomUUID(),
    playerId: player.id,
    missionId: mission.id,
    cash: Math.round(mission.rewards.cash * economy.cashMultiplier),
    xp: mission.rewards.xp,
    reputation: mission.rewards.reputation,
    sol,
    status: sol > 0 ? "pending" : "paid",
    createdAt: new Date().toISOString(),
  };

  const nextPlayer: Player = {
    ...player,
    currencies: {
      cash: player.currencies.cash + reward.cash,
      xp: player.currencies.xp + reward.xp,
      reputation: player.currencies.reputation + reward.reputation,
      sol: player.currencies.sol,
    },
    wantedStars: mission.type === "heist" ? Math.min(5, player.wantedStars + 1) : player.wantedStars,
    missionsCompleted: player.missionsCompleted + 1,
  };

  const supabase = getServerSupabase();
  if (supabase) {
    await supabase.from("rewards").insert(toRewardRow(reward));
    await supabase.from("players").update(toPlayerRow(nextPlayer)).eq("id", player.id);
  }

  localPlayers.set(walletKey(player.walletAddress), nextPlayer);
  localRewards.set(reward.id, reward);
  activeMissions.delete(key);

  return { ok: true, player: nextPlayer, reward, verification };
}

export async function claimRewards(walletAddress: string) {
  const player = await getOrCreatePlayer(walletAddress);
  const pending = [...localRewards.values()].filter((reward) => reward.playerId === player.id && reward.sol > 0);
  return {
    player,
    rewards: pending,
    message:
      pending.length > 0
        ? "SOL rewards are queued for admin approval and server-side payout."
        : "No verified SOL rewards are waiting for approval.",
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("players")
      .select("id, handle, wallet_address, currencies, missions_completed")
      .eq("banned", false)
      .order("missions_completed", { ascending: false })
      .limit(25);
    if (data?.length) return data.map(fromLeaderboardRow);
  }

  return [...localPlayers.values()]
    .filter((player) => !player.banned)
    .map((player) => ({
      id: player.id,
      handle: player.handle,
      walletAddress: player.walletAddress,
      reputation: player.currencies.reputation,
      cash: player.currencies.cash,
      solEarned: [...localRewards.values()]
        .filter((reward) => reward.playerId === player.id && ["approved", "paid"].includes(reward.status))
        .reduce((sum, reward) => sum + reward.sol, 0),
      missionsCompleted: player.missionsCompleted,
    }))
    .sort((a, b) => b.reputation - a.reputation || b.cash - a.cash)
    .slice(0, 25);
}

export async function getAdminSnapshot() {
  return {
    players: [...localPlayers.values()],
    rewards: [...localRewards.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    logs: adminLogs,
    economy,
    missions: await getMissions(),
  };
}

export async function runAdminAction(action: AdminAction) {
  if (action.type === "approveReward") {
    const reward = localRewards.get(action.rewardId);
    if (!reward) return { ok: false as const, error: "Reward not found." };
    const nextReward = { ...reward, status: "approved" as const };
    localRewards.set(reward.id, nextReward);
    const player = [...localPlayers.values()].find((item) => item.id === reward.playerId);
    if (player) {
      localPlayers.set(player.walletAddress, {
        ...player,
        currencies: { ...player.currencies, sol: Number((player.currencies.sol + reward.sol).toFixed(6)) },
      });
    }
    addAdminLog(action.actor, "approve_reward", `Approved ${reward.sol} SOL for mission ${reward.missionId}`);
    return { ok: true as const };
  }

  if (action.type === "banPlayer") {
    const player = [...localPlayers.values()].find((item) => item.id === action.playerId);
    if (!player) return { ok: false as const, error: "Player not found." };
    localPlayers.set(player.walletAddress, { ...player, banned: action.banned });
    addAdminLog(action.actor, action.banned ? "ban_player" : "unban_player", player.handle);
    return { ok: true as const };
  }

  if (action.type === "spawnEvent") {
    addAdminLog(action.actor, "spawn_event", `${action.name} in ${action.district}`);
    return { ok: true as const };
  }

  if (action.type === "changeEconomy") {
    economy.cashMultiplier = Math.max(0.25, Math.min(3, action.cashMultiplier));
    economy.solEnabled = action.solEnabled;
    addAdminLog(action.actor, "change_economy", `cash x${economy.cashMultiplier}, sol enabled: ${economy.solEnabled}`);
    return { ok: true as const };
  }

  createdMissions.unshift({ ...action.mission, id: `admin-${Date.now().toString(36)}`, status: "available" });
  addAdminLog(action.actor, "create_mission", action.mission.title);
  return { ok: true as const };
}

function toPlayerRow(player: Player) {
  return {
    id: player.id,
    wallet_address: player.walletAddress,
    handle: player.handle,
    currencies: player.currencies,
    character: player.character,
    inventory: player.inventory,
    vehicles: player.vehicles,
    wanted_stars: player.wantedStars,
    banned: player.banned,
    missions_completed: player.missionsCompleted,
    created_at: player.createdAt,
  };
}

function fromPlayerRow(row: Record<string, any>): Player {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    handle: row.handle,
    createdAt: row.created_at,
    currencies: row.currencies,
    character: row.character,
    inventory: row.inventory,
    vehicles: row.vehicles,
    wantedStars: row.wanted_stars,
    banned: row.banned,
    missionsCompleted: row.missions_completed,
  };
}

function fromMissionRow(row: Record<string, any>): Mission {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    district: row.district,
    briefing: row.briefing,
    objective: row.objective,
    start: row.start_position,
    target: row.target_position,
    minSeconds: row.min_seconds,
    maxSeconds: row.max_seconds,
    requiredDistance: row.required_distance,
    rewards: row.rewards,
    solEligible: row.sol_eligible,
    status: "available",
  };
}

function toRewardRow(reward: RewardRecord) {
  return {
    id: reward.id,
    player_id: reward.playerId,
    mission_id: reward.missionId,
    cash: reward.cash,
    xp: reward.xp,
    reputation: reward.reputation,
    sol: reward.sol,
    status: reward.status,
    created_at: reward.createdAt,
  };
}

function fromLeaderboardRow(row: Record<string, any>): LeaderboardEntry {
  return {
    id: row.id,
    handle: row.handle,
    walletAddress: row.wallet_address,
    reputation: row.currencies?.reputation ?? 0,
    cash: row.currencies?.cash ?? 0,
    solEarned: row.currencies?.sol ?? 0,
    missionsCompleted: row.missions_completed ?? 0,
  };
}
