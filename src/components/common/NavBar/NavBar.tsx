"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/constants';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { useAuthStore } from '@/store/authStore';
import { FaBars } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const navLinks = [
  { name: 'Home', href: ROUTES.DASHBOARD },
  { name: 'Productos', href: ROUTES.PRODUCTS },
  { name: 'Acerca de Nosotros', href: ROUTES.ABOUT },
  { name: 'Contacto', href: ROUTES.CONTACT },
];

export default function NavBar() {
  const pathname = usePathname() || "";
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="Logo" width={40} height={40} className="rounded-full object-cover" />
          <span className="font-extrabold text-amber-700 text-lg tracking-wide">Mermeladas</span>
        </Link>
        {/* Links escritorio */}
        <ul className="hidden md:flex gap-4 md:gap-8 items-center">
          {navLinks.map(link => {
            const isHome = link.href === ROUTES.DASHBOARD;
            const isActive =
              pathname === link.href ||
              (!isHome && pathname.startsWith(link.href) && pathname !== "/");
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors duration-200 text-sm md:text-base
                    ${isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Menú usuario escritorio */}
        <div className="ml-4 hidden md:block">
          <UserMenu />
        </div>
        {/* Responsive: solo usuario y hamburguesa */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          {isAuthenticated && (
            <span className="font-semibold text-gray-700 truncate max-w-[100px]">{user?.nombre}</span>
          )}
          <button
            className="p-2 rounded-md hover:bg-amber-100 focus:outline-none"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Abrir menú"
          >
            <FaBars className="text-2xl text-amber-700" />
          </button>
          {/* Menú móvil desplegable */}
          {mobileMenuOpen && (
            <div ref={menuRef} className="absolute top-16 right-4 w-48 bg-white rounded-lg shadow-lg border z-50 animate-fade-in flex flex-col">
              <ul className="flex flex-col divide-y divide-amber-100">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-amber-50 font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-amber-100 p-2">
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 