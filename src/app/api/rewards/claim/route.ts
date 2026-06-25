import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";

const claimSchema = z.object({
  rewardId: z.string().min(8),
  walletAddress: z.string().min(32),
});

export async function POST(req: NextRequest) {
  try {
    const body = claimSchema.parse(await req.json());
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      const claimed = demoDb.claimReward(body.walletAddress, body.rewardId);
      return NextResponse.json({
        claimed: true,
        signature: claimed.transactionSignature,
        sol: claimed.sol,
        source: "demo",
      });
    }

    const { data: rewardRow, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("reward_id", body.rewardId)
      .single();

    if (rewardError) {
      return NextResponse.json({ error: rewardError.message }, { status: 404 });
    }
    if (rewardRow.wallet_address !== body.walletAddress) {
      return NextResponse.json({ error: "Reward ownership mismatch." }, { status: 403 });
    }
    if (rewardRow.status !== "pending_claim") {
      return NextResponse.json({ error: "Reward is not claimable." }, { status: 409 });
    }

    const signature = `devnet-${crypto.randomUUID().replace(/-/g, "").slice(0, 40)}`;
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("rewards")
      .update({
        status: "claimed",
        transaction_signature: signature,
        claimed_at: now,
      })
      .eq("reward_id", body.rewardId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.rpc("apply_player_reward", {
      p_wallet_address: body.walletAddress,
      p_cash: 0,
      p_xp: 0,
      p_reputation: 0,
      p_sol: rewardRow.sol,
    });

    return NextResponse.json({ claimed: true, signature, sol: rewardRow.sol, source: "supabase" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}

