'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants';
import Navbar from '@/components/layout/Navbar';


export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a {APP_CONFIG.name}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Tu tienda en línea moderna y escalable
          </p>

          {isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                ¡Bienvenido de vuelta!
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex justify-between">
                  <span className="font-medium">Nombre:</span>
                  <span>{user?.nombre} {user?.apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Teléfono:</span>
                  <span>{user?.numero_telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Rol:</span>
                  <span className="capitalize">{user?.rol}</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/products">
                  <Button className="w-full">
                    Ver Productos
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    Mi Perfil
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Comienza tu experiencia
              </h3>
              <p className="text-gray-600 mb-6">
                Regístrate o inicia sesión para acceder a todas las funcionalidades de nuestra tienda.
              </p>
              <Link href="/login">
                <Button size="lg">
                  Comenzar
                </Button>
              </Link>
            </div>
          )}
        </div>

        

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Compra Fácil
            </h3>
            <p className="text-gray-600">
              Navega por nuestro catálogo y realiza compras de manera sencilla y segura.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 text-3xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Entrega Rápida
            </h3>
            <p className="text-gray-600">
              Recibe tus productos en la puerta de tu casa con nuestro sistema de entrega.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-purple-600 text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chat en Tiempo Real
            </h3>
            <p className="text-gray-600">
              Comunícate directamente con vendedores para resolver dudas y consultas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
