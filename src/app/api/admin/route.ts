import { NextRequest, NextResponse } from "next/server";
import {
  addAdminLog,
  getAdminLogs,
  getEconomy,
  getLeaderboard,
  getPendingRewards,
  setBanned,
  setEconomy,
  updateRewardStatus,
} from "@/lib/db";
import { DEFAULT_ADMIN_PASS } from "@/lib/constants";
import { generateMissions } from "@/lib/missions";

export const dynamic = "force-dynamic";

function authed(pass: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;
  return pass === expected;
}

// POST /api/admin { pass, action, ... }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { pass, action } = body as { pass?: string; action?: string };

  if (!authed(pass ?? null)) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  switch (action) {
    case "login": {
      return NextResponse.json({ ok: true });
    }
    case "dashboard": {
      const [pending, logs, board] = await Promise.all([
        getPendingRewards(),
        getAdminLogs(),
        getLeaderboard(),
      ]);
      return NextResponse.json({ pending, logs, board, economy: getEconomy() });
    }
    case "create_missions": {
      const count = Math.min(12, Math.max(1, Number(body.count ?? 6)));
      const missions = generateMissions(count);
      await addAdminLog("create_missions", `Generated ${count} missions`);
      return NextResponse.json({ missions });
    }
    case "approve_reward": {
      await updateRewardStatus(body.rewardId, "approved");
      await addAdminLog("approve_reward", `Approved reward ${body.rewardId}`);
      return NextResponse.json({ ok: true });
    }
    case "reject_reward": {
      await updateRewardStatus(body.rewardId, "rejected");
      await addAdminLog("reject_reward", `Rejected reward ${body.rewardId}`);
      return NextResponse.json({ ok: true });
    }
    case "mark_paid": {
      await updateRewardStatus(body.rewardId, "paid", body.signature);
      await addAdminLog("mark_paid", `Marked ${body.rewardId} paid (${body.signature ?? "n/a"})`);
      return NextResponse.json({ ok: true });
    }
    case "ban_player": {
      await setBanned(body.playerId, true);
      await addAdminLog("ban_player", `Banned ${body.playerId}`);
      return NextResponse.json({ ok: true });
    }
    case "unban_player": {
      await setBanned(body.playerId, false);
      await addAdminLog("unban_player", `Unbanned ${body.playerId}`);
      return NextResponse.json({ ok: true });
    }
    case "spawn_event": {
      const name = String(body.event ?? "Neon Surge");
      await addAdminLog("spawn_event", `Spawned event: ${name}`);
      return NextResponse.json({ ok: true, event: name });
    }
    case "set_economy": {
      const patch: { cashMultiplier?: number; solMultiplier?: number } = {};
      if (body.cashMultiplier !== undefined) patch.cashMultiplier = Number(body.cashMultiplier);
      if (body.solMultiplier !== undefined) patch.solMultiplier = Number(body.solMultiplier);
      setEconomy(patch);
      await addAdminLog("set_economy", `Economy updated: ${JSON.stringify(patch)}`);
      return NextResponse.json({ ok: true, economy: getEconomy() });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
