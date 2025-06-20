// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

type IdParams = { id: string };

// GET /api/reviews/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<IdParams> }  // params as Promise for Next.js 15
) {
  const { id } = await params;
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  verifyToken(token);

  const reviewId = parseInt(id, 10);
  const result = await query(
    `SELECT * FROM reviews WHERE id = $1`,
    [reviewId]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ review: result.rows[0] });
}

// PUT /api/reviews/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<IdParams> }
) {
  const { id } = await params;
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { userId } = verifyToken(token);

  const reviewId = parseInt(id, 10);
  const body = await request.json();
  const { book_title, rating, review, mood } = reviewSchema.parse(body);

  const ownerRes = await query(
    `SELECT user_id FROM reviews WHERE id = $1`,
    [reviewId]
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
    [book_title, rating, review, mood, reviewId]
  );

  return NextResponse.json({ review: result.rows[0] });
}

// DELETE /api/reviews/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<IdParams> }
) {
  const { id } = await params;
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { userId } = verifyToken(token);

  const reviewId = parseInt(id, 10);
  await query(
    `DELETE FROM reviews WHERE id = $1 AND user_id = $2`,
    [reviewId, userId]
  );

  return NextResponse.json({ success: true });
}
