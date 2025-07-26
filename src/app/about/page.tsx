'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acerca de Nosotros
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Conoce más sobre nuestra empresa y misión
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Nuestra Historia
            </h2>
            <p className="text-gray-600 mb-6">
              Somos una empresa comprometida con la innovación y la excelencia en el servicio al cliente. 
              Nuestra misión es proporcionar productos de alta calidad a través de una plataforma moderna 
              y fácil de usar.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Nuestra Misión
            </h2>
            <p className="text-gray-600 mb-6">
              Facilitar el acceso a productos de calidad, conectando compradores y vendedores de manera 
              eficiente y segura, promoviendo el comercio local y la satisfacción del cliente.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Calidad en todos nuestros productos y servicios</li>
              <li>Innovación constante en nuestra plataforma</li>
              <li>Confianza y seguridad en todas las transacciones</li>
              <li>Compromiso con la satisfacción del cliente</li>
              <li>Responsabilidad social y ambiental</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 