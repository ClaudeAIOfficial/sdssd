import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/leaderboard -> top players by reputation, cash, SOL earned and missions.
export async function GET() {
  const board = await getLeaderboard();
  return NextResponse.json(board);
}
