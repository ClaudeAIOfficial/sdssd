import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";

export async function GET(req: NextRequest) {
  const walletAddress = req.nextUrl.searchParams.get("wallet");
  if (!walletAddress) {
    return NextResponse.json({ error: "wallet query param is required." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({
      rewards: demoDb.listRewards(walletAddress),
      source: "demo",
    });
  }

  const { data, error } = await supabase
    .from("rewards")
    .select("reward_id,cash,xp,reputation,sol,status,transaction_signature,created_at,claimed_at")
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rewards: data, source: "supabase" });
}

