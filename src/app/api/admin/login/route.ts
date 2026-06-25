import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminToken } from "@/lib/admin-auth";

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
    const expectedPass = process.env.ADMIN_PASSWORD ?? "admin123";

    if (body.username !== expectedUser || body.password !== expectedPass) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json({
      token: createAdminToken(body.username),
      username: body.username,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

