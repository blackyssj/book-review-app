// src/components/ReviewCard.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

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

type Props = {
  review: Review;
  currentUserId: number;
  onDelete: (id: number) => void;
};

export function ReviewCard({ review, currentUserId, onDelete }: Props) {
  const router = useRouter();

  // Mapeo de colores para cada mood
  const moodColors: Record<string, string> = {
    feliz:      "bg-green-100 text-green-800",
    triste:     "bg-blue-100 text-blue-800",
    emocionado: "bg-yellow-100 text-yellow-800",
    aburrida:   "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 transition hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {review.book_title}
          </h3>
          {review.reviewer_name && (
            <p className="text-sm text-gray-500">Por {review.reviewer_name}</p>
          )}
          <p className="text-sm text-gray-500">
            {new Date(review.created_at).toLocaleString()}
          </p>
        </div>
        {review.user_id === currentUserId && (
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/edit-review/${review.id}`)}
              className="text-blue-500 hover:underline text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="text-red-500 hover:underline text-sm"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p>
          <span className="font-medium">⭐ Puntuación:</span> {review.rating}/5
        </p>

        {/* Píldora de Mood */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Mood:</span>
          <span
            className={
              "px-2 py-1 rounded-full text-sm font-medium " +
              (moodColors[review.mood] ?? "bg-gray-100 text-gray-800")
            }
          >
            {review.mood}
          </span>
        </div>

        <p className="mt-2 text-gray-700">{review.review}</p>
      </div>
    </div>
  );
}
