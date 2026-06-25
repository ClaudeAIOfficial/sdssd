import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePlayer, getPlayer, isBanned, updatePlayer } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/player?id=...  -> fetch an existing player
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const player = await getPlayer(id);
  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ player });
}

// POST /api/player  { wallet, handle? } -> get or create (first connection signs up)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const wallet: string | null = body.wallet ?? null;
  const handle: string | undefined = body.handle;
  const player = await getOrCreatePlayer(wallet, handle);
  if (await isBanned(player.id)) {
    return NextResponse.json({ error: "This account is banned." }, { status: 403 });
  }
  return NextResponse.json({ player });
}

// PATCH /api/player  { id, appearance?, handle? } -> persist cosmetic profile
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, appearance, handle } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const player = await updatePlayer(id, {
    ...(appearance ? { appearance } : {}),
    ...(handle ? { handle } : {}),
  });
  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ player });
}
