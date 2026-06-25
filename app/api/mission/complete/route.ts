import { NextResponse } from "next/server";
import { z } from "zod";
import { completeMission } from "@/lib/server/db";

const vector = z.tuple([z.number(), z.number()]);

const completionRequest = z.object({
  missionId: z.string().min(3),
  walletAddress: z.string().min(12),
  elapsedSeconds: z.number().positive(),
  distanceTravelled: z.number().nonnegative(),
  start: vector,
  finish: vector,
  maxSpeed: z.number().positive(),
  collisions: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const body = completionRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid mission telemetry." }, { status: 400 });
  }

  const result = await completeMission(body.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, reasons: result.reasons ?? [] }, { status: result.status });
  }

  return NextResponse.json({
    player: result.player,
    reward: result.reward,
    verification: result.verification,
  });
}
