"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600 animate-fade-in px-2">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs sm:max-w-md md:max-w-lg">
        <div className="animate-bounce">
          <div className="w-24 h-24 rounded-full bg-white p-2 shadow-lg flex items-center justify-center">
            <Image
              src="/logo.jpeg"
              alt="Logo Mermeladas"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-wide animate-pulse text-center">
          Mermeladas Artesanales
        </h1>
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="w-10 h-10 border-4 border-white border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-base sm:text-lg text-white/80 mt-2">Cargando dulzura...</span>
        </div>
      </div>
    </div>
  );
}
