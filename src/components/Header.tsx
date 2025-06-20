"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function Header() {
  const router = useRouter();
  const { userId, loading } = useUser();

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          📚 BookReviews
        </Link>
        <nav className="space-x-6 text-gray-700">
          {!loading && userId ? (
            <>
              <Link href="/reviews" className="hover:text-indigo-600">
                Reseñas
              </Link>
              <Link href="/add-review" className="hover:text-indigo-600">
                Añadir
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="hover:text-indigo-600">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
