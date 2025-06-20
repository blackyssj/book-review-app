// src/app/api/reviews/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

type Context = { params: { id: string } };

export async function GET(
  request: Request,
  { params }: Context
) {
  // Autorización
  const token = request.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  verifyToken(token);

  const id = parseInt(params.id, 10);
  const result = await query(
    `SELECT * FROM reviews WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ review: result.rows[0] });
}

export async function PUT(
  request: Request,
  { params }: Context
) {
  const token = request.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { userId } = verifyToken(token);

  const id = parseInt(params.id, 10);
  const body = await request.json();
  const { book_title, rating, review, mood } = reviewSchema.parse(body);

  // Comprobar propietario
  const ownerRes = await query(
    `SELECT user_id FROM reviews WHERE id = $1`,
    [id]
  );
  if (ownerRes.rows[0]?.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await query(
    `UPDATE reviews
        SET book_title = $1,
            rating     = $2,
            review     = $3,
            mood       = $4
      WHERE id = $5
      RETURNING *`,
    [book_title, rating, review, mood, id]
  );

  return NextResponse.json({ review: result.rows[0] });
}

export async function DELETE(
  request: Request,
  { params }: Context
) {
  const token = request.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { userId } = verifyToken(token);

  const id = parseInt(params.id, 10);
  await query(
    `DELETE FROM reviews WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return NextResponse.json({ success: true });
}
