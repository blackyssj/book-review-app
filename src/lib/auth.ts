// src/lib/auth.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

////////////////////////////////////////////////////////////////////////////////
// 1) Configuración de constantes
////////////////////////////////////////////////////////////////////////////////

// Debe coincidir con lo que pusiste en .env.local
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "token";

////////////////////////////////////////////////////////////////////////////////
// 2) Funciones de hashing de contraseña
////////////////////////////////////////////////////////////////////////////////

/**
 * Recibe una contraseña en texto plano y retorna su hash.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Compara una contraseña en texto plano con su hash.
 * Retorna true si coinciden.
 */
export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

////////////////////////////////////////////////////////////////////////////////
// 3) Funciones de JWT
////////////////////////////////////////////////////////////////////////////////

/**
 * Crea un token JWT incluyendo { userId } en su payload.
 * Vigencia: 7 días.
 */
export function signToken(payload: { userId: number }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifica un token JWT y retorna su payload decodificado.
 * Arroja si el token es inválido o expiró.
 */
export function verifyToken(token: string): { userId: number; iat: number; exp: number } {
  return jwt.verify(token, JWT_SECRET) as {
    userId: number;
    iat: number;
    exp: number;
  };
}

////////////////////////////////////////////////////////////////////////////////
// 4) Helpers de Cookie (NextResponse)
//    Usaremos NextResponse para App Router
////////////////////////////////////////////////////////////////////////////////

/**
 * Añade la cookie HttpOnly al NextResponse.
 * - path="/" para que esté disponible en toda la app.
 * - maxAge en segundos (7 días).
 * - sameSite lax y secure en producción.
 */
export function setTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
