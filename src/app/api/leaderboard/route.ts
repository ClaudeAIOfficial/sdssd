import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ entries: demoDb.listLeaderboard(), source: "demo" });
  }

  const { data, error } = await supabase
    .from("leaderboard")
    .select("wallet_address,reputation,cash,sol_earned,missions_completed")
    .order("reputation", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    entries:
      data?.map((row) => ({
        walletAddress: row.wallet_address,
        reputation: row.reputation,
        cash: row.cash,
        solEarned: row.sol_earned,
        missionsCompleted: row.missions_completed,
      })) ?? [],
    source: "supabase",
  });
}

