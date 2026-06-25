import { NextRequest, NextResponse } from "next/server";
import { getPlayer, getRewards } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/rewards/claim?playerId=... -> transaction history for the wallet panel.
export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
  const rewards = await getRewards(playerId);
  return NextResponse.json({ rewards });
}

// POST /api/rewards/claim { playerId }
// Requests payout of approved SOL rewards. IMPORTANT: this endpoint NEVER signs
// or sends a transaction from the client. It only queues approved rewards for a
// backend treasury process / admin to fulfil. The client receives a queued
// status, not signed funds.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const playerId: string | undefined = body.playerId;
  if (!playerId) return NextResponse.json({ error: "Missing playerId" }, { status: 400 });

  const player = await getPlayer(playerId);
  if (!player) return NextResponse.json({ error: "Unknown player" }, { status: 404 });

  const rewards = await getRewards(playerId);
  const claimable = rewards.filter((r) => r.status === "approved" && r.sol > 0);
  const queuedSol = claimable.reduce((sum, r) => sum + r.sol, 0);

  return NextResponse.json({
    queued: claimable.length,
    queuedSol: Number(queuedSol.toFixed(5)),
    wallet: player.wallet,
    message:
      claimable.length > 0
        ? "Your verified SOL rewards are queued for payout from the treasury."
        : "No approved SOL rewards ready to claim yet. Verified missions appear here once approved.",
  });
}
