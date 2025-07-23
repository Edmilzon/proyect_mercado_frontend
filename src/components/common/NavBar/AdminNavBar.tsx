'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon, 
  CubeIcon, 
  UsersIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const adminLinks = [
  { href: '/admin', label: 'Lista de pedidos', icon: ClipboardDocumentListIcon },
  { href: '/admin/productos', label: 'Productos', icon: CubeIcon },
  { href: '/admin/usuarios', label: 'Usuarios', icon: UsersIcon }, // Placeholder
  { href: '/admin/reportes', label: 'Reportes', icon: ChartBarIcon },
];

export default function AdminNavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar al hacer click en un link en móvil
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón hamburguesa para móviles */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-60 md:hidden bg-amber-600 text-white p-2 rounded-lg shadow-lg hover:bg-amber-700 transition-colors"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay para móviles */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-white/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-full bg-gradient-to-b from-amber-900 to-amber-800 shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${isMobile ? 'w-64 transform' : 'w-64'}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-amber-700">
            <div className="text-2xl font-bold text-white tracking-wide">Panel Admin</div>
            <div className="text-amber-200 text-sm mt-1">Gestión de Ventas</div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {adminLinks.map(link => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-amber-600 text-white shadow-lg' 
                        : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-300 group-hover:text-white'}`} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-amber-700">
            <div className="text-amber-200 text-xs text-center">
              Sistema de Administración
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 