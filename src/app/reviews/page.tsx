// src/app/reviews/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  reviewer_name?: string;
};

export default function ReviewsPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [moodParam, setMoodParam] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParam(params.get("search") || "");
    setMoodParam(params.get("mood") || "");
  }, []);

  // Protege ruta
  useEffect(() => {
    if (!userLoading && userId === null) {
      router.push("/login");
    }
  }, [userLoading, userId, router]);

  // Carga reseñas
  useEffect(() => {
    if (userLoading || userId === null) return;
    setLoading(true);
    const url = new URL("/api/reviews", window.location.origin);
    if (searchParam) url.searchParams.set("search", searchParam);
    if (moodParam) url.searchParams.set("mood", moodParam);

    fetch(url.toString(), { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          router.push("/login");
          return { reviews: [] };
        }
        return res.json();
      })
      .then(json => setReviews(json.reviews))
      .finally(() => setLoading(false));
  }, [userLoading, userId, router, searchParam, moodParam]);

  if (userLoading || loading) return <p className="text-center mt-20 text-gray-500">Cargando reseñas…</p>;
  if (userId === null) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-end gap-4 mb-6">
        <input
          placeholder="Buscar título"
          defaultValue={searchParam}
          onBlur={e => setSearchParam(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <select
          defaultValue={moodParam}
          onChange={e => setMoodParam(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todos moods</option>
          <option value="feliz">Feliz</option>
          <option value="triste">Triste</option>
          <option value="emocionado">Emocionado</option>
          <option value="aburrida">Aburrida</option>
        </select>
        <button
          onClick={() => {
            const qs = new URLSearchParams();
            if (searchParam) qs.set("search", searchParam);
            if (moodParam) qs.set("mood", moodParam);
            router.push(`/reviews?${qs.toString()}`);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Aplicar filtros
        </button>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push("/add-review")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nueva Reseña
        </button>
      </div>
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(r => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={userId}
              onDelete={async id => {
                if (!confirm("¿Eliminar reseña?")) return;
                await fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "include" });
                setReviews(prev => prev.filter(x => x.id !== id));
              }}
            />
          ))
        ) : (
          <p className="text-center text-gray-600">No hay reseñas disponibles.</p>
        )}
      </div>
    </div>
  );
}
