// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  // — Autorización —
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  verifyToken(token);

  // — Lectura de query-params “search” y “mood” —
  const url = req.nextUrl;
  const search = url.searchParams.get("search") ?? "";
  const mood   = url.searchParams.get("mood")   ?? "";

  // — Construir WHERE dinámico —
  const clauses: string[] = [];
  const values: any[]    = [];

  if (search) {
    values.push(`%${search}%`);
    clauses.push(`r.book_title ILIKE $${values.length}`);
  }
  if (mood) {
    values.push(mood);
    clauses.push(`r.mood = $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  // — Consulta con filtros si los hay —
  const result = await query<{
    id: number;
    book_title: string;
    rating: number;
    review: string;
    mood: string;
    created_at: string;
    user_id: number;
    reviewer_name: string;
  }>(
    `
    SELECT
      r.id, r.book_title, r.rating, r.review, r.mood, r.created_at,
      r.user_id, u.name AS reviewer_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    ${where}
    ORDER BY r.created_at DESC
    `,
    values
  );

  return NextResponse.json({ reviews: result.rows });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { userId } = verifyToken(token);

  const body = await req.json();
  // validación con tu reviewSchema (Zod)…
  const { book_title, rating, review, mood } = reviewSchema.parse(body);

  const result = await query(
    `
    INSERT INTO reviews (user_id, book_title, rating, review, mood)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, book_title, rating, review, mood, created_at, user_id
    `,
    [userId, book_title, rating, review, mood]
  );

  return NextResponse.json({ review: result.rows[0] }, { status: 201 });
}
