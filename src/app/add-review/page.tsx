"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { FormInput } from "@/components/FormInput";

type FormData = {
  book_title: string;
  rating: number;
  review: string;
  mood: string;
};

export default function AddReviewPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // 🔐 Protección de la ruta
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/login");
    }
  }, [userLoading, userId, router]);

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (res.ok) {
      router.push("/reviews");
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  // No renderizar hasta conocer estado de auth
  if (userLoading || !userId) {
    return <p className="mt-16 text-center">Verificando usuario…</p>;
  }

  return (
    <main className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Nueva Reseña</h1>
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
            valueAsNumber: true, // Convertir el valor a number
          })}
          error={errors.rating?.message}
        />

        <div className="mb-4">
          <label className="block font-medium mb-1">Reseña</label>
          <textarea
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            {...register("review", { required: "Requerido" })}
          ></textarea>
          {errors.review && (
            <p className="text-red-600 text-sm mt-1">{errors.review.message}</p>
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
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          {isSubmitting ? "Guardando..." : "Guardar Reseña"}
        </button>
      </form>
    </main>
  );
}
