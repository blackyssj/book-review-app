// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";           // Tu CSS global (todavía vacío de Tailwind)
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Review App",
  description: "Reseñas de libros con Next.js, TypeScript y PostgreSQL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-gray-50">
      <head>
        {/* --- DIAGNÓSTICO Tailwind via CDN --- */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body
        className={`min-h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased text-gray-800`}
      >
        <Header />
        {/* Si Tailwind CDN carga, verás este fondo rojo pálido */}
        <main className="container mx-auto px-4 py-8 flex-grow ">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
