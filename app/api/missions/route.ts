import { NextResponse } from "next/server";
import { getMissions } from "@/lib/server/db";

export async function GET() {
  const missions = await getMissions();
  return NextResponse.json({ missions });
}
