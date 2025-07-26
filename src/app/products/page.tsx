'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Descubre nuestra amplia selección de productos
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            🚧 Esta página está en construcción. Próximamente tendrás acceso a nuestro catálogo completo de productos.
          </p>
        </div>
      </div>
    </div>
  );
} 