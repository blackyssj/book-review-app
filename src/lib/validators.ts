// src/lib/validators.ts
import { z } from "zod";

export const signupSchema = z.object({
  name:     z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
// src/lib/validators.ts (extensión)
export const reviewSchema = z.object({
  book_title: z.string().min(1, "El título es obligatorio"),
  rating:     z.number().int().min(1).max(5),
  review:     z.string().min(1, "El texto de la reseña es obligatorio"),
  mood:       z.string().min(1, "El campo mood es obligatorio"),
});