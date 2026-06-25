import { NextResponse } from "next/server";
import { verifyMissionAttempt } from "@/lib/anti-cheat";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { MissionAttempt } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    attempt?: MissionAttempt;
    completedMissionIds?: string[];
  };

  if (!body.attempt) {
    return NextResponse.json({ ok: false, reason: "Mission attempt is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let completedMissionIds = body.completedMissionIds ?? [];
  let playerId = body.attempt.walletAddress;

  if (supabase && body.attempt.walletAddress) {
    const { data: player, error } = await supabase
      .from("players")
      .select("id, completed_missions, banned")
      .eq("wallet_address", body.attempt.walletAddress)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    }

    if (player?.banned) {
      return NextResponse.json({ ok: false, reason: "Player is banned." }, { status: 403 });
    }

    completedMissionIds = Array.isArray(player?.completed_missions) ? player.completed_missions : completedMissionIds;
    playerId = player?.id ?? playerId;
  }

  const result = verifyMissionAttempt(body.attempt, completedMissionIds);

  if (!result.ok || !result.rewards || !result.mission) {
    return NextResponse.json(result, { status: 422 });
  }

  if (supabase && playerId) {
    const { error: rewardError } = await supabase.from("rewards").insert({
      player_id: playerId,
      mission_id: result.mission.id,
      claim_id: result.claimId,
      cash: result.rewards.cash,
      sol: result.rewards.sol,
      xp: result.rewards.xp,
      reputation: result.rewards.reputation,
      status: result.rewards.sol > 0 ? "pending_admin_review" : "approved",
      verification_payload: body.attempt
    });

    if (rewardError) {
      return NextResponse.json({ ok: false, reason: rewardError.message }, { status: 409 });
    }

    await supabase.rpc("apply_verified_reward", {
      player_key: playerId,
      mission_key: result.mission.id,
      reward_cash: result.rewards.cash,
      reward_sol: result.rewards.sol,
      reward_xp: result.rewards.xp,
      reward_reputation: result.rewards.reputation
    });
  }

  return NextResponse.json(result);
}
