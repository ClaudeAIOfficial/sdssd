import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";

const walletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { walletAddress?: string };
    const walletAddress = body.walletAddress?.trim();

    if (!walletAddress || !walletRegex.test(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      const player = demoDb.upsertPlayer(walletAddress);
      return NextResponse.json({ player, source: "demo" });
    }

    const now = new Date().toISOString();
    const payload = {
      wallet_address: walletAddress,
      username: `Player-${walletAddress.slice(0, 4)}`,
      cash: 500,
      sol_balance: 0,
      xp: 0,
      reputation: 0,
      missions_completed: 0,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("players")
      .upsert(payload, { onConflict: "wallet_address" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ player: data, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}

