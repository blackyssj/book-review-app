// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

type Params = { params: { id: string } };

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  verifyToken(token);

  const reviewId = Number(params.id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const result = await query(
    `SELECT id, book_title, rating, review, mood, created_at, user_id
     FROM reviews WHERE id = $1`,
    [reviewId]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { userId } = verifyToken(token);

  const reviewId = Number(params.id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await query<{ user_id: number }>(
    "SELECT user_id FROM reviews WHERE id = $1",
    [reviewId]
  );
  if (existing.rowCount === 0) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const body = await req.json();
  const data = reviewSchema.partial().parse(body);
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const setClause = keys.map((k, i) => `"${k}"=$${i + 2}`).join(", ");
  const values = keys.map((k) => (data as any)[k]);
  await query(`UPDATE reviews SET ${setClause} WHERE id = $1`, [reviewId, ...values]);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { userId } = verifyToken(token);

  const reviewId = Number(params.id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await query<{ user_id: number }>(
    "SELECT user_id FROM reviews WHERE id = $1",
    [reviewId]
  );
  if (existing.rowCount === 0) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  await query("DELETE FROM reviews WHERE id = $1", [reviewId]);
  return NextResponse.json({ success: true });
}
