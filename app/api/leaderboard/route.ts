import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/server/db";

export async function GET() {
  const leaderboard = await getLeaderboard();
  return NextResponse.json({ leaderboard });
}
