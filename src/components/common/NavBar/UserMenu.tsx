"use client";
import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/common/Button/Button";
import { ROUTES } from "@/config/constants";

export default function UserMenu() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    
  }, [open]);
  console.log(user);
  if (!isAuthenticated) {
    return (
      <div className="flex gap-2 items-center">
        <Link href={ROUTES.LOGIN}>
          <Button size="sm" variant="secondary" className="px-3 py-1">
            Iniciar sesión
          </Button>
        </Link>
        <Link href={ROUTES.REGISTER}>
          <Button size="sm" className="px-3 py-1">
            Registrarse
          </Button>
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
      >
        <FaUserCircle className="text-3xl text-amber-700" />
        <span className="hidden md:inline font-semibold text-gray-700">
          {user?.nombre || "Perfil"}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50 animate-fade-in">
          <Link
            href="/perfil"
            className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-gray-700"
            onClick={() => setOpen(false)}
          >
            <FaUser /> Ver perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-amber-50 text-red-600"
          >
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
} 