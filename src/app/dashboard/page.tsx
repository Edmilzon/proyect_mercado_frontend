"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ROUTES } from "@/config/constants";
import Button from "@/components/common/Button/Button";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner/Spinner";
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Dashboard() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const { products, loading, error } = useProducts();
  const { isAdmin } = useAuth();

  const nextSlide = () => setCurrent((prev) => (prev + 1) % products.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + products.length) % products.length);

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [current, products.length, nextSlide]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-500">Cargando mermeladas...</span>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || "No hay productos disponibles"}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-10 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-extrabold text-amber-700 mb-2 text-center drop-shadow">¡Bienvenido a Mermeladas Artesanales!</h1>
        <p className="text-lg text-gray-700 text-center mb-4 max-w-2xl">
          Descubre el auténtico sabor de la fruta en cada frasco. Elaboramos mermeladas 100% naturales, sin conservantes, con recetas familiares y mucho amor. ¡Déjate tentar por nuestra variedad!
        </p>
        {/* Carrousel */}
        <div className="relative w-full max-w-xl h-[500px] flex items-center justify-center">
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-amber-200 text-amber-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
            aria-label="Anterior"
          >
            &#8592;
          </button>
          <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg overflow-hidden">
            <Image
              src={products[current].imagen}
              alt={products[current].nombre}
              width={400}
              height={500}
              className="object-contain w-full h-[400px] md:h-[460px]"
              priority
            />
            <div className="p-4 w-full text-center">
              <h2 className="text-2xl font-bold text-amber-700 mb-1">{products[current].nombre}</h2>
              <p className="text-gray-600 text-sm">{products[current].descripcion}</p>
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-amber-200 text-amber-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
            aria-label="Siguiente"
          >
            &#8594;
          </button>
        </div>
        {/* Indicadores */}
        <div className="flex gap-2 mt-2">
          {products.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full ${idx === current ? 'bg-amber-600' : 'bg-amber-200'} transition-all`}
            />
          ))}
        </div>
        <Button
          size="lg"
          className="mt-8 px-8 py-3 text-lg font-bold bg-amber-600 hover:bg-amber-700"
          onClick={() => router.push(ROUTES.PRODUCTS)}
        >
          Ver productos
        </Button>
        {isAdmin && (
          <div className="my-4">
            <Link href={ROUTES.ADMIN} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition">
              Panel de Administración
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 