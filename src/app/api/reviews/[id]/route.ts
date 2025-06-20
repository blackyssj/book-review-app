import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

// GET /api/reviews/[id]
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }   // ← firma válida
) {
  const id = Number(params.id);

  const result = await query("SELECT * FROM reviews WHERE id = $1", [id]);
  if (!result.rows.length) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

// PUT /api/reviews/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers
    .get("cookie")
    ?.match(/token=([^;]+)/)?.[1];
  if (!token)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { userId } = verifyToken(token);
  const id = Number(params.id);
  const body = reviewSchema.parse(await request.json());

  // comprueba que el review sea del usuario
  const ownerRes = await query("SELECT user_id FROM reviews WHERE id = $1", [id]);
  if (ownerRes.rows[0]?.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await query(
    `UPDATE reviews
       SET book_title=$1, rating=$2, review=$3, mood=$4
     WHERE id=$5 RETURNING *`,
    [body.book_title, body.rating, body.review, body.mood, id]
  );

  return NextResponse.json(updated.rows[0]);
}

// DELETE /api/reviews/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const token = _request.headers
    .get("cookie")
    ?.match(/token=([^;]+)/)?.[1];
  if (!token)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { userId } = verifyToken(token);
  const id = Number(params.id);

  await query("DELETE FROM reviews WHERE id=$1 AND user_id=$2", [id, userId]);
  return NextResponse.json({ success: true });
}
