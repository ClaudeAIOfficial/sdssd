import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreatePlayer } from "@/lib/server/db";

const playerRequest = z.object({
  walletAddress: z.string().min(12),
});

export async function POST(request: Request) {
  const body = playerRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Valid walletAddress is required." }, { status: 400 });
  }

  const player = await getOrCreatePlayer(body.data.walletAddress);
  return NextResponse.json({ player });
}
