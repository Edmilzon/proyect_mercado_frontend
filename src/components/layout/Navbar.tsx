'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants';
import { cartService } from '@/services/cart';
import { useState as useStateCart, useEffect as useEffectCart } from 'react';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  HomeIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  PhoneIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  TruckIcon
} from '@heroicons/react/24/outline';


export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useStateCart(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug: mostrar estado de autenticación en consola
  useEffect(() => {
    console.log('Navbar Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  // Actualizar contador del carrito
  useEffectCart(() => {
    const updateCartCount = () => {
      const count = cartService.getCartItemCount();
      setCartItemCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/cart');
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Productos', href: '/products', icon: ShoppingBagIcon },
    { name: 'Acerca de', href: '/about', icon: InformationCircleIcon },
    { name: 'Contacto', href: '/contact', icon: PhoneIcon },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {APP_CONFIG.name}
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              onClick={handleCartClick}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.nombre?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.nombre}
                  </span>
                  <ChevronDownIcon 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {user?.rol}
                      </span>
                    </div>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      Ver Perfil
                    </Link>
                    
                    <Link
                      href="/profile/edit"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Link>
                    
                    {user?.rol === 'vendedor' && (
                      <>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <ShoppingBagIcon className="w-4 h-4 mr-2" />
                          Panel Vendedor
                        </Link>
                        <Link
                          href="/seller/reviews"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <StarIcon className="w-4 h-4 mr-2" />
                          Mis Reseñas
                        </Link>
                      </>
                    )}
                    
                    {(user?.rol === 'admin' || user?.rol === 'super_admin') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <CogIcon className="w-4 h-4 mr-2" />
                        Panel Admin
                      </Link>
                    )}
                    
                    <Link
                      href="/profile/reviews"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                      Mis Reseñas
                    </Link>
                    
                    <Link
                      href="/chat"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                      Chat
                    </Link>
                    
                    <Link
                      href="/logistics"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <TruckIcon className="w-4 h-4 mr-2" />
                      Logística
                    </Link>
                    
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/login?register=true">
                  <Button 
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 border border-black"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 