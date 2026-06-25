import { NextResponse } from "next/server";
import { z } from "zod";
import { startMission } from "@/lib/server/db";

const startRequest = z.object({
  walletAddress: z.string().min(12),
  missionId: z.string().min(3),
});

export async function POST(request: Request) {
  const body = startRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "walletAddress and missionId are required." }, { status: 400 });
  }

  const result = await startMission(body.data.walletAddress, body.data.missionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ player: result.player, mission: result.mission });
}
