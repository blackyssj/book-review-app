// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { comparePassword, signToken, setTokenCookie } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const result = await query<{ id: number; password: string }>(
      "SELECT id,password FROM users WHERE email=$1",
      [email]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const { id: userId, password: hash } = result.rows[0];
    const valid = await comparePassword(password, hash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const token = signToken({ userId });
    const res = NextResponse.json({ userId });
    setTokenCookie(res, token);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
