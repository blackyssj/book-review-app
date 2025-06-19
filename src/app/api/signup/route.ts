// src/app/api/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators";
import { hashPassword, signToken, setTokenCookie } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Leer y validar el body con Zod
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    // 2️⃣ Hashear la contraseña
    const hashedPw = await hashPassword(password);

    // 3️⃣ Insertar nuevo usuario en la DB
    const result = await query<{ id: number }>(
      "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id",
      [name, email, hashedPw]
    );
    const userId = result.rows[0].id;

    // 4️⃣ Generar JWT y enviarlo en cookie HttpOnly
    const token = signToken({ userId });
    const res = NextResponse.json({ userId }, { status: 201 });
    setTokenCookie(res, token);

    return res;
  } catch (err: any) {
    // Manejo de errores
    const message =
      // Código de violación de unicidad en PostgreSQL
      err.code === "23505"
        ? "El email ya está registrado."
        : err.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
