"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/FormInput";
import { useUser } from "@/hooks/useUser";

type FormData = {
  book_title: string;
  rating: number;
  review: string;
  mood: string;
};

export default function EditReviewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { userId, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>();

  useEffect(() => {
    if (!authLoading && userId === null) return router.push("/login");
    if (!id) return;
    fetch(`/api/reviews/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        reset({
          book_title: data.book_title,
          rating: data.rating,
          review: data.review,
          mood: data.mood,
        });
        setLoading(false);
      })
      .catch(() => router.push("/reviews"));
  }, [id, authLoading, userId, router, reset]);

  async function onSubmit(data: FormData) {
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    router.push("/reviews");
  }

  if (authLoading || loading)
    return <p className="text-center mt-20 text-gray-500">Cargando…</p>;
  if (userId === null) return null;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Reseña</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Título del libro"
          {...register("book_title", { required: "Requerido" })}
          error={errors.book_title?.message}
        />
        <FormInput
          label="Puntuación (1-5)"
          type="number"
          {...register("rating", {
            required: "Requerido",
            min: { value: 1, message: "Mínimo 1" },
            max: { value: 5, message: "Máximo 5" },
            valueAsNumber: true,
          })}
          error={errors.rating?.message}
        />
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Reseña
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            {...register("review", { required: "Requerido" })}
          />
          {errors.review && (
            <p className="mt-1 text-sm text-red-600">{errors.review.message}</p>
          )}
        </div>
        <FormInput
          label="Mood"
          {...register("mood", { required: "Requerido" })}
          error={errors.mood?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
