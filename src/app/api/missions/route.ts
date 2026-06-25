import { NextRequest, NextResponse } from "next/server";
import { generateMissions } from "@/lib/missions";

export const dynamic = "force-dynamic";

// GET /api/missions?count=6 -> server-generated mission board.
export async function GET(req: NextRequest) {
  const count = Math.min(12, Math.max(1, Number(req.nextUrl.searchParams.get("count") ?? 6)));
  return NextResponse.json({ missions: generateMissions(count) });
}
