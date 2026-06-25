import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { demoDb } from "@/lib/demo-db";

const bodySchema = z.object({
  action: z.enum(["create_mission", "approve_reward", "ban_player", "spawn_event", "change_economy"]),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const getAdminUser = (req: NextRequest) => {
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = verifyAdminToken(bearer);
  return decoded?.sub ?? null;
};

export async function GET(req: NextRequest) {
  const actor = getAdminUser(req);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        logs: demoDb.listAdminLogs(),
        missions: demoDb.listCreatedMissions(),
        source: "demo",
      },
      { status: 200 },
    );
  }

  const [{ data: logs }, { data: missions }] = await Promise.all([
    supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(40),
    supabase.from("missions").select("mission_run_id,mission_type,created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({ logs: logs ?? [], missions: missions ?? [], source: "supabase" });
}

export async function POST(req: NextRequest) {
  const actor = getAdminUser(req);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      let result: unknown;
      switch (body.action) {
        case "create_mission":
          result = demoDb.createMission(
            String(body.payload.title ?? "Admin Mission"),
            Number(body.payload.payoutMultiplier ?? 1.25),
          );
          break;
        case "ban_player":
          result = demoDb.banPlayer(String(body.payload.walletAddress ?? ""));
          break;
        case "approve_reward":
          result = { approved: true, rewardId: body.payload.rewardId };
          break;
        case "spawn_event":
          result = { spawned: true, event: body.payload.eventName ?? "City blackout" };
          break;
        case "change_economy":
          result = { updated: true, economy: body.payload };
          break;
        default:
          result = null;
      }

      const log = demoDb.createAdminLog({
        actor,
        action: body.action,
        payload: body.payload,
      });
      return NextResponse.json({ ok: true, result, log, source: "demo" });
    }

    const logPayload = {
      actor,
      action: body.action,
      payload: body.payload,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("admin_logs").insert(logPayload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.action === "ban_player") {
      const walletAddress = String(body.payload.walletAddress ?? "");
      await supabase.from("players").update({ is_banned: true }).eq("wallet_address", walletAddress);
    }

    return NextResponse.json({ ok: true, source: "supabase" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}

