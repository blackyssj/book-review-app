"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const router = useRouter();

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (res.ok) router.push("/reviews");
    else alert((await res.json()).error);
  }

  return (
    <main className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Email" type="email" {...register("email", { required: "Requerido" })} error={errors.email?.message} />
        <FormInput label="Contraseña" type="password" {...register("password", { required: "Requerido" })} error={errors.password?.message} />
        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded">
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
