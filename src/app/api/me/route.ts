// src/app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // 1) Extraer token de la cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    // No hay token → no logueado
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2) Verificar y decodificar
    const { userId } = verifyToken(token);
    // 3) Devolver el userId
    return NextResponse.json({ userId });
  } catch (err: any) {
    // Token inválido o expirado
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
