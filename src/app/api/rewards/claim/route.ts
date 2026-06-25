import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { walletAddress } = (await request.json()) as { walletAddress?: string };

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      status: "queued",
      message: "Local reward claim queued. Configure Supabase service role keys to persist payout review records."
    });
  }

  const { data: player, error: playerError } = await supabase.from("players").select("id, sol_earned").eq("wallet_address", walletAddress).single();

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("reward_claims")
    .insert({
      player_id: player.id,
      wallet_address: walletAddress,
      amount_sol: player.sol_earned,
      status: "pending_admin_approval"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
