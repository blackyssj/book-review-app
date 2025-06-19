// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { reviewSchema } from "@/lib/validators";

////////////////////////////////////////////////////////////////////////////////
// GET /api/reviews
////////////////////////////////////////////////////////////////////////////////
export async function GET(req: NextRequest) {
  try {
    // 1) Autorización: extraer y verificar JWT
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    verifyToken(token);

    // 2) Leer todas las reseñas con el nombre del autor
    const result = await query<{
      id: number;
      book_title: string;
      rating: number;
      review: string;
      mood: string;
      created_at: string;
      user_id: number;
    }>(
      `SELECT r.id, r.book_title, r.rating, r.review, r.mood, r.created_at, r.user_id
       FROM reviews r
       ORDER BY r.created_at DESC`
    );

    return NextResponse.json({ reviews: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.name === "JsonWebTokenError" ? 401 : 500 });
  }
}

////////////////////////////////////////////////////////////////////////////////
// POST /api/reviews
////////////////////////////////////////////////////////////////////////////////
export async function POST(req: NextRequest) {
  try {
    // 1) Autorización
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { userId } = verifyToken(token);

    // 2) Validación del body
    const body = await req.json();
    const { book_title, rating, review, mood } = reviewSchema.parse(body);

    // 3) Insertar en la DB
    const result = await query<{ id: number }>(
      `INSERT INTO reviews(user_id, book_title, rating, review, mood)
       VALUES($1,$2,$3,$4,$5) RETURNING id`,
      [userId, book_title, rating, review, mood]
    );
    const id = result.rows[0].id;

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    const message = err.errors ? err.errors.map((e: any) => e.message).join(", ") : err.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
