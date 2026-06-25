import { NextRequest, NextResponse } from "next/server";
import type { MissionCompletionPayload, MissionCompletionResult } from "@/lib/types";
import { verifyCompletion } from "@/lib/antiCheat";
import {
  addAdminLog,
  getEconomy,
  getPlayer,
  isBanned,
  recordReward,
  updatePlayer,
} from "@/lib/db";
import { levelFromXp } from "@/lib/economy";

export const dynamic = "force-dynamic";

// POST /api/missions/complete
// The single source of truth for awarding rewards. The browser cannot mint
// rewards: this endpoint independently validates movement + timing and clamps
// the payout to server-computed bounds before persisting it.
export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as MissionCompletionPayload | null;
  if (!payload || !payload.playerId || !payload.missionId) {
    return NextResponse.json<MissionCompletionResult>(
      { ok: false, reason: "Malformed completion payload." },
      { status: 400 },
    );
  }

  const player = await getPlayer(payload.playerId);
  if (!player) {
    return NextResponse.json<MissionCompletionResult>(
      { ok: false, reason: "Unknown player." },
      { status: 404 },
    );
  }
  if (await isBanned(player.id)) {
    return NextResponse.json<MissionCompletionResult>(
      { ok: false, reason: "Account banned." },
      { status: 403 },
    );
  }

  const verdict = verifyCompletion(payload);
  if (!verdict.ok) {
    await addAdminLog("mission_rejected", `${player.handle}: ${verdict.reason} (${payload.missionType})`);
    return NextResponse.json<MissionCompletionResult>({ ok: false, reason: verdict.reason });
  }

  // Apply admin-tunable economy multipliers.
  const econ = getEconomy();
  const granted = {
    cash: Math.round(verdict.granted.cash * econ.cashMultiplier),
    xp: verdict.granted.xp,
    reputation: verdict.granted.reputation,
    sol: Number((verdict.granted.sol * econ.solMultiplier).toFixed(5)),
  };

  // Persist the new economy state authoritatively.
  const newXp = player.xp + granted.xp;
  const lvl = levelFromXp(newXp);
  const updated = await updatePlayer(player.id, {
    cash: player.cash + granted.cash,
    sol: player.sol + granted.sol,
    xp: newXp,
    level: lvl.level,
    reputation: player.reputation + granted.reputation,
    missionsCompleted: player.missionsCompleted + 1,
  });

  // SOL payouts are recorded as PENDING — they require admin approval and are
  // never paid out by the client (see /api/rewards/claim).
  const reward = await recordReward({
    playerId: player.id,
    missionId: payload.missionId,
    cash: granted.cash,
    xp: granted.xp,
    reputation: granted.reputation,
    sol: granted.sol,
    status: granted.sol > 0 ? "pending" : "approved",
    signature: null,
  });

  await addAdminLog(
    "mission_complete",
    `${player.handle} completed ${payload.missionType} (+$${granted.cash}, +${granted.sol} SOL)`,
  );

  return NextResponse.json<MissionCompletionResult>({
    ok: true,
    granted,
    reward,
    ...(updated ? {} : {}),
  });
}
