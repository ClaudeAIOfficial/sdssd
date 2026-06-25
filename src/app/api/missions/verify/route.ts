import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";
import { MissionReward } from "@/lib/types";

const reportSchema = z.object({
  missionId: z.string().min(8),
  missionType: z.enum([
    "deliver_package",
    "taxi_run",
    "street_race",
    "collect_wallets",
    "defeat_gang",
    "protect_npc",
    "steal_package",
    "find_hardware_wallet",
  ]),
  walletAddress: z.string().optional(),
  startedAt: z.number().positive(),
  completedAt: z.number().positive(),
  elapsedSeconds: z.number().positive(),
  distanceTravelled: z.number().nonnegative(),
  startPosition: z.object({ x: z.number(), z: z.number() }),
  endPosition: z.object({ x: z.number(), z: z.number() }),
  wantedLevelDuringMission: z.number().min(0).max(5),
});

const walletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const validateAntiCheat = (report: z.infer<typeof reportSchema>) => {
  if (report.elapsedSeconds < 12) {
    return "Mission completed too quickly.";
  }
  if (report.elapsedSeconds > 20 * 60) {
    return "Mission exceeded allowed time.";
  }
  const avgSpeed = report.distanceTravelled / Math.max(report.elapsedSeconds, 1);
  if (avgSpeed > 60) {
    return "Movement speed impossible.";
  }
  if (report.distanceTravelled < 8) {
    return "Mission distance too low.";
  }
  const startToEnd = Math.hypot(
    report.startPosition.x - report.endPosition.x,
    report.startPosition.z - report.endPosition.z,
  );
  if (startToEnd > report.distanceTravelled + 5) {
    return "Distance telemetry mismatch.";
  }
  return null;
};

const rewardFromReport = (report: z.infer<typeof reportSchema>): MissionReward => {
  const missionWeight = Math.max(1, Math.min(5, Math.ceil(report.distanceTravelled / 40)));
  const riskBonus = 1 + report.wantedLevelDuringMission * 0.1;
  const cash = Math.round((200 + missionWeight * 180) * riskBonus);
  const xp = Math.round((50 + missionWeight * 40) * riskBonus);
  const reputation = Math.max(10, Math.round(20 + missionWeight * 14 + report.wantedLevelDuringMission * 6));
  const solChance = 0.18 + report.wantedLevelDuringMission * 0.02;
  const sol = Math.random() < solChance ? Number((0.001 + Math.random() * 0.007).toFixed(4)) : 0;

  return {
    cash,
    xp,
    reputation,
    sol,
    verified: true,
    rewardId: `reward-${crypto.randomUUID().slice(0, 8)}`,
  };
};

export async function POST(req: NextRequest) {
  try {
    const input = reportSchema.parse(await req.json());
    if (!input.walletAddress || !walletRegex.test(input.walletAddress)) {
      return NextResponse.json({ error: "Valid wallet required for verified rewards." }, { status: 400 });
    }

    const antiCheatError = validateAntiCheat(input);
    if (antiCheatError) {
      return NextResponse.json({ error: antiCheatError, verified: false }, { status: 400 });
    }

    const reward = rewardFromReport(input);
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      demoDb.addMissionRun(input.walletAddress, input, reward);
      return NextResponse.json({ verified: true, reward, source: "demo" });
    }

    const { data: existingMission } = await supabase
      .from("missions")
      .select("id")
      .eq("mission_run_id", input.missionId)
      .maybeSingle();

    if (existingMission) {
      return NextResponse.json({ error: "Duplicate mission completion." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { error: missionError } = await supabase.from("missions").insert({
      mission_run_id: input.missionId,
      mission_type: input.missionType,
      wallet_address: input.walletAddress,
      status: "completed",
      started_at: new Date(input.startedAt).toISOString(),
      completed_at: new Date(input.completedAt).toISOString(),
      telemetry: {
        elapsedSeconds: input.elapsedSeconds,
        distanceTravelled: input.distanceTravelled,
        startPosition: input.startPosition,
        endPosition: input.endPosition,
        wantedLevelDuringMission: input.wantedLevelDuringMission,
      },
      created_at: now,
    });

    if (missionError) {
      return NextResponse.json({ error: missionError.message }, { status: 500 });
    }

    const { error: rewardsError } = await supabase.from("rewards").insert({
      reward_id: reward.rewardId,
      mission_run_id: input.missionId,
      wallet_address: input.walletAddress,
      cash: reward.cash,
      xp: reward.xp,
      reputation: reward.reputation,
      sol: reward.sol,
      status: reward.sol > 0 ? "pending_claim" : "credited",
      verified: true,
      created_at: now,
    });

    if (rewardsError) {
      return NextResponse.json({ error: rewardsError.message }, { status: 500 });
    }

    await supabase.rpc("apply_player_reward", {
      p_wallet_address: input.walletAddress,
      p_cash: reward.cash,
      p_xp: reward.xp,
      p_reputation: reward.reputation,
      p_sol: reward.sol > 0 ? 0 : reward.sol,
    });

    return NextResponse.json({ verified: true, reward, source: "supabase" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}

