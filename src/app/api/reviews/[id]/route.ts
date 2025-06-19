// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) Autorización
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { userId } = verifyToken(token);

    // 2) Verificar que el review existe y pertenece al usuario
    const reviewId = parseInt(params.id, 10);
    const existing = await query<{ user_id: number }>(
      "SELECT user_id FROM reviews WHERE id = $1",
      [reviewId]
    );
    if (!existing.rowCount) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }
    if (existing.rows[0].user_id !== userId) {
      return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
    }

    // 3) Borrar la reseña
    await query("DELETE FROM reviews WHERE id = $1", [reviewId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
