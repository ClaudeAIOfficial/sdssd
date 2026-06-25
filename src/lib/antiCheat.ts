import type { MissionCompletionPayload, MissionReward } from "./types";
import { maxRewardBounds } from "./missions";
import { PLAYER, VEHICLE } from "./constants";

export interface AntiCheatVerdict {
  ok: boolean;
  reason?: string;
  /** Reward clamped to server-computed maxima. */
  granted: MissionReward;
}

// Track the last reward time per (player+mission) to block duplicate payouts.
const g = globalThis as unknown as { __gtsRewardGuard?: Map<string, number> };
const rewardGuard: Map<string, number> = g.__gtsRewardGuard ?? (g.__gtsRewardGuard = new Map());

const FASTEST_VEHICLE = Math.max(...Object.values(VEHICLE).map((v) => v.topSpeed));

/**
 * Server-authoritative validation of a mission completion. The browser can
 * never mint its own rewards: every payout is clamped to server-side bounds and
 * checked against physically plausible movement + timing.
 */
export function verifyCompletion(p: MissionCompletionPayload): AntiCheatVerdict {
  const empty: MissionReward = { cash: 0, xp: 0, reputation: 0, sol: 0 };

  // 1. Basic temporal sanity.
  const durationSec = (p.finishedAt - p.startedAt) / 1000;
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return { ok: false, reason: "Invalid mission timing.", granted: empty };
  }
  // Missions cannot be completed implausibly fast (instant-complete cheat).
  if (durationSec < 2) {
    return { ok: false, reason: "Mission completed impossibly fast.", granted: empty };
  }
  // Or absurdly long (stale / replayed sessions).
  if (durationSec > 60 * 30) {
    return { ok: false, reason: "Mission session expired.", granted: empty };
  }

  // 2. Distance plausibility — required straight-line distance vs travelled.
  const required = Math.hypot(p.target.x - p.origin.x, p.target.z - p.origin.z);
  if (p.distanceTravelled + 1 < required * 0.6) {
    return { ok: false, reason: "Reported travel distance too short for objective.", granted: empty };
  }

  // 3. Impossible movement — average speed cannot exceed the fastest vehicle
  //    (plus a tolerance for jitter).
  const avgSpeed = p.distanceTravelled / durationSec;
  const maxPlausible = Math.max(PLAYER.runSpeed, FASTEST_VEHICLE) * 1.6;
  if (avgSpeed > maxPlausible) {
    return { ok: false, reason: "Impossible movement speed detected.", granted: empty };
  }

  // 4. Duplicate reward guard (same player + mission within a short window).
  const key = `${p.playerId}:${p.missionId}`;
  const last = rewardGuard.get(key);
  const now = Date.now();
  if (last && now - last < 60 * 1000) {
    return { ok: false, reason: "Duplicate reward blocked.", granted: empty };
  }

  // 5. Clamp declared reward to server bounds.
  const bounds = maxRewardBounds(p.missionType, p.difficulty);
  const granted: MissionReward = {
    cash: clamp(p.declaredReward.cash, 0, bounds.cash),
    xp: clamp(p.declaredReward.xp, 0, bounds.xp),
    reputation: clamp(p.declaredReward.reputation, 0, bounds.reputation),
    sol: clamp(p.declaredReward.sol, 0, bounds.sol),
  };

  rewardGuard.set(key, now);
  return { ok: true, granted };
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
