import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    passcode?: string;
    action?: "create_mission" | "approve_reward" | "ban_player" | "spawn_event" | "change_economy";
    payload?: Record<string, unknown>;
  };

  const expectedPasscode = process.env.ADMIN_PASSCODE;

  if (!expectedPasscode || body.passcode !== expectedPasscode) {
    return NextResponse.json({ error: "Invalid admin passcode" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "local",
      action: body.action,
      message: "Admin action accepted locally. Configure Supabase to persist logs and economy changes."
    });
  }

  const { data, error } = await supabase
    .from("admin_logs")
    .insert({
      action: body.action,
      payload: body.payload ?? {},
      actor: "browser-admin"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, log: data });
}
