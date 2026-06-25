import { NextResponse } from "next/server";
import { seedLeaderboard } from "@/lib/game-data";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(seedLeaderboard);
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, handle, reputation, cash, sol_earned, completed_missions")
    .eq("banned", false)
    .order("reputation", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json(seedLeaderboard);
  }

  return NextResponse.json(
    data.map((row) => ({
      id: row.id,
      handle: row.handle,
      reputation: row.reputation,
      cash: row.cash,
      solEarned: row.sol_earned,
      missions: Array.isArray(row.completed_missions) ? row.completed_missions.length : 0
    }))
  );
}
