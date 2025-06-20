// src/components/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} BookReviews • Todos los derechos reservados
      </div>
    </footer>
  );
}
