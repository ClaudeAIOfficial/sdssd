import { NextResponse } from "next/server";
import { createLocalPlayer } from "@/lib/game-data";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { walletAddress } = (await request.json()) as { walletAddress?: string };

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const profile = createLocalPlayer(walletAddress);

  if (!supabase) {
    return NextResponse.json(profile);
  }

  const { data, error } = await supabase
    .from("players")
    .upsert(
      {
        id: profile.id,
        handle: profile.handle,
        wallet_address: walletAddress,
        cosmetics: profile.cosmetics,
        cash: profile.ledger.cash,
        sol_earned: profile.ledger.sol,
        xp: profile.ledger.xp,
        reputation: profile.ledger.reputation,
        owned_vehicles: profile.ownedVehicles,
        inventory: profile.inventory,
        completed_missions: profile.completedMissions,
        wanted_stars: profile.wantedStars,
        banned: false
      },
      { onConflict: "wallet_address", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
