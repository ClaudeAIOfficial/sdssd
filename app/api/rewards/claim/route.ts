import { NextResponse } from "next/server";
import { z } from "zod";
import { claimRewards } from "@/lib/server/db";

const claimRequest = z.object({
  walletAddress: z.string().min(12),
});

export async function POST(request: Request) {
  const body = claimRequest.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Valid walletAddress is required." }, { status: 400 });
  }

  const result = await claimRewards(body.data.walletAddress);
  return NextResponse.json(result);
}
