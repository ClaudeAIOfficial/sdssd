import { AdminLog, LeaderboardEntry, MissionReport, MissionReward } from "@/lib/types";

type DemoPlayer = {
  walletAddress: string;
  username: string;
  cash: number;
  sol: number;
  xp: number;
  reputation: number;
  missionsCompleted: number;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
};

type DemoReward = {
  id: string;
  walletAddress: string;
  cash: number;
  xp: number;
  reputation: number;
  sol: number;
  claimedAt: string | null;
  createdAt: string;
  verified: boolean;
  transactionSignature: string | null;
};

type DemoMissionRun = {
  id: string;
  walletAddress: string;
  report: MissionReport;
  rewardId: string;
  verified: boolean;
  createdAt: string;
};

const players = new Map<string, DemoPlayer>();
const rewards = new Map<string, DemoReward>();
const missionRuns = new Map<string, DemoMissionRun>();
const adminLogs: AdminLog[] = [];
const createdMissions: Array<{ id: string; title: string; payoutMultiplier: number; createdAt: string }> = [];

const nowIso = () => new Date().toISOString();

const ensurePlayer = (walletAddress: string): DemoPlayer => {
  const existing = players.get(walletAddress);
  if (existing) {
    return existing;
  }
  const created: DemoPlayer = {
    walletAddress,
    username: `Player-${walletAddress.slice(0, 4)}`,
    cash: 500,
    sol: 0,
    xp: 0,
    reputation: 0,
    missionsCompleted: 0,
    banned: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  players.set(walletAddress, created);
  return created;
};

export const demoDb = {
  upsertPlayer(walletAddress: string) {
    return ensurePlayer(walletAddress);
  },

  addMissionRun(walletAddress: string, report: MissionReport, reward: MissionReward) {
    const player = ensurePlayer(walletAddress);
    const rewardId = reward.rewardId ?? `reward-${crypto.randomUUID().slice(0, 8)}`;

    if (missionRuns.has(report.missionId)) {
      throw new Error("MISSION_ALREADY_RECORDED");
    }

    const rewardRow: DemoReward = {
      id: rewardId,
      walletAddress,
      cash: reward.cash,
      xp: reward.xp,
      reputation: reward.reputation,
      sol: reward.sol,
      claimedAt: reward.sol > 0 ? null : nowIso(),
      createdAt: nowIso(),
      verified: reward.verified,
      transactionSignature: reward.sol > 0 ? null : "offchain-credit",
    };
    rewards.set(rewardId, rewardRow);

    missionRuns.set(report.missionId, {
      id: report.missionId,
      walletAddress,
      report,
      rewardId,
      verified: reward.verified,
      createdAt: nowIso(),
    });

    player.cash += reward.cash;
    player.xp += reward.xp;
    player.reputation += reward.reputation;
    player.sol += reward.sol > 0 ? 0 : reward.sol;
    player.missionsCompleted += 1;
    player.updatedAt = nowIso();

    players.set(walletAddress, player);
    return rewardRow;
  },

  claimReward(walletAddress: string, rewardId: string) {
    const reward = rewards.get(rewardId);
    if (!reward) {
      throw new Error("REWARD_NOT_FOUND");
    }
    if (reward.walletAddress !== walletAddress) {
      throw new Error("REWARD_OWNERSHIP_INVALID");
    }
    if (reward.claimedAt) {
      throw new Error("REWARD_ALREADY_CLAIMED");
    }
    reward.claimedAt = nowIso();
    reward.transactionSignature = `devnet-${crypto.randomUUID().replace(/-/g, "").slice(0, 40)}`;
    rewards.set(rewardId, reward);

    const player = ensurePlayer(walletAddress);
    player.sol += reward.sol;
    player.updatedAt = nowIso();
    players.set(walletAddress, player);

    return reward;
  },

  listRewards(walletAddress: string) {
    return [...rewards.values()]
      .filter((reward) => reward.walletAddress === walletAddress)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((reward) => ({
        reward_id: reward.id,
        cash: reward.cash,
        xp: reward.xp,
        reputation: reward.reputation,
        sol: reward.sol,
        status: reward.claimedAt ? "claimed" : "pending_claim",
        transaction_signature: reward.transactionSignature,
        created_at: reward.createdAt,
        claimed_at: reward.claimedAt,
      }));
  },

  listLeaderboard(): LeaderboardEntry[] {
    return [...players.values()]
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 20)
      .map((player) => ({
        walletAddress: player.walletAddress,
        reputation: player.reputation,
        cash: player.cash,
        solEarned: player.sol,
        missionsCompleted: player.missionsCompleted,
      }));
  },

  createAdminLog(log: Omit<AdminLog, "id" | "createdAt">) {
    const row: AdminLog = {
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: nowIso(),
      action: log.action,
      actor: log.actor,
      payload: log.payload,
    };
    adminLogs.unshift(row);
    return row;
  },

  listAdminLogs() {
    return adminLogs.slice(0, 40);
  },

  banPlayer(walletAddress: string) {
    const player = ensurePlayer(walletAddress);
    player.banned = true;
    player.updatedAt = nowIso();
    players.set(walletAddress, player);
    return player;
  },

  createMission(title: string, payoutMultiplier: number) {
    const mission = {
      id: `admin-mission-${crypto.randomUUID().slice(0, 8)}`,
      title,
      payoutMultiplier,
      createdAt: nowIso(),
    };
    createdMissions.unshift(mission);
    return mission;
  },

  listCreatedMissions() {
    return createdMissions.slice(0, 20);
  },
};

