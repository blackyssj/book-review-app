// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

//
// GET /api/reviews/:id
//
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }    // <— aquí va esta forma, no tu tipo Params
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

//
// PUT /api/reviews/:id
//
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { userId } = verifyToken(token);

  const id = parseInt(params.id, 10);
  const body = await req.json();
  const { book_title, rating, review, mood } = reviewSchema.parse(body);

  // Asegurarnos de que el owner coincide
  const ownerCheck = await query(
    `SELECT user_id FROM reviews WHERE id = $1`,
    [id]
  );
  if (ownerCheck.rows[0]?.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await query(
    `
    UPDATE reviews
       SET book_title = $1,
           rating     = $2,
           review     = $3,
           mood       = $4
     WHERE id = $5
     RETURNING *
    `,
    [book_title, rating, review, mood, id]
  );
  return NextResponse.json({ review: result.rows[0] });
}

//
// DELETE /api/reviews/:id
//
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { userId } = verifyToken(token);

  const id = parseInt(params.id, 10);
  // Validar owner
  await query(
    `DELETE FROM reviews WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return NextResponse.json({ success: true });
}
