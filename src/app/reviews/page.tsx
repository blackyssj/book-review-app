'use client';  // ← Marca todo el archivo como cliente

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ReviewCard } from "@/components/ReviewCard";

type Review = {
  id: number;
  book_title: string;
  rating: number;
  review: string;
  mood: string;
  created_at: string;
  user_id: number;
  reviewer_name: string;
};

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const moodParam   = searchParams.get("mood")   ?? "";

  const { userId, loading: userLoading } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Protección de ruta
  useEffect(() => {
    if (!userLoading && userId === null) {
      router.push("/login");
    }
  }, [userLoading, userId, router]);

  // Carga de reseñas con filtros
  useEffect(() => {
    if (userLoading || userId === null) return;
    setLoading(true);

    const url = new URL("/api/reviews", window.location.origin);
    if (searchParam) url.searchParams.set("search", searchParam);
    if (moodParam)   url.searchParams.set("mood", moodParam);

    fetch(url.toString(), { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return { reviews: [] };
        }
        return res.json();
      })
      .then((json) => setReviews(json.reviews))
      .finally(() => setLoading(false));
  }, [userLoading, userId, router, searchParam, moodParam]);

  if (userLoading || loading) {
    return <p className="text-center mt-20 text-gray-500">Cargando reseñas…</p>;
  }
  if (userId === null) return null;

  return (
    <>
      {/* Filtro y búsqueda */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as any;
          const s = form.search.value.trim();
          const m = form.mood.value.trim();
          const qs = new URLSearchParams();
          if (s) qs.set("search", s);
          if (m) qs.set("mood", m);
          router.push(`/reviews?${qs.toString()}`);
        }}
        className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar título
          </label>
          <input
            name="search"
            defaultValue={searchParam}
            placeholder="Ej: Principito"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar mood
          </label>
          <select
            name="mood"
            defaultValue={moodParam}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Todos</option>
            <option value="feliz">Feliz</option>
            <option value="triste">Triste</option>
            <option value="emocionado">Emocionado</option>
            <option value="aburrida">Aburrida</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-2 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Aplicar
        </button>
      </form>

      {/* Botón de nueva reseña */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push("/add-review")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Nueva Reseña
        </button>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={userId}
              onDelete={async (id) => {
                if (!confirm("¿Eliminar reseña?")) return;
                await fetch(`/api/reviews/${id}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                setReviews((prev) => prev.filter((x) => x.id !== id));
              }}
            />
          ))
        ) : (
          <p className="text-center text-gray-600">No hay reseñas con esos criterios.</p>
        )}
      </div>
    </>
  );
}
