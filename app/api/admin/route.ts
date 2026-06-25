import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSnapshot, runAdminAction } from "@/lib/server/db";

const adminAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("approveReward"), rewardId: z.string(), actor: z.string().default("admin") }),
  z.object({ type: z.literal("banPlayer"), playerId: z.string(), banned: z.boolean(), actor: z.string().default("admin") }),
  z.object({ type: z.literal("spawnEvent"), name: z.string().min(2), district: z.string().min(2), actor: z.string().default("admin") }),
  z.object({
    type: z.literal("changeEconomy"),
    cashMultiplier: z.number().positive(),
    solEnabled: z.boolean(),
    actor: z.string().default("admin"),
  }),
  z.object({
    type: z.literal("createMission"),
    actor: z.string().default("admin"),
    mission: z.object({
      id: z.string().default("admin-draft"),
      title: z.string().min(3),
      type: z.enum(["delivery", "taxi", "race", "collect", "defeat", "protect", "heist", "recover"]),
      district: z.enum(["Downtown", "Neon Beach", "Harbor", "Casino Row", "Warehouse Ward", "Civic Center"]),
      briefing: z.string().min(8),
      objective: z.string().min(8),
      start: z.tuple([z.number(), z.number()]),
      target: z.tuple([z.number(), z.number()]),
      minSeconds: z.number().positive(),
      maxSeconds: z.number().positive(),
      requiredDistance: z.number().positive(),
      rewards: z.object({
        cash: z.number().nonnegative(),
        sol: z.number().nonnegative(),
        xp: z.number().nonnegative(),
        reputation: z.number().nonnegative(),
      }),
      solEligible: z.boolean(),
      status: z.enum(["available", "active", "completed", "failed"]).default("available"),
    }),
  }),
]);

function authorized(request: Request) {
  const configured = process.env.ADMIN_API_KEY;
  if (!configured) return true;
  return request.headers.get("x-admin-key") === configured;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }
  const snapshot = await getAdminSnapshot();
  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  const body = adminAction.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid admin action." }, { status: 400 });
  }

  const result = await runAdminAction(body.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
