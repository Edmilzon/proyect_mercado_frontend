'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Estamos aquí para ayudarte. ¡Ponte en contacto con nosotros!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Envíanos un Mensaje
            </h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Tu nombre"
                />
                <Input
                  label="Apellido"
                  placeholder="Tu apellido"
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
              />
              
              <Input
                label="Asunto"
                placeholder="¿En qué podemos ayudarte?"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
              
              <Button className="w-full">
                Enviar Mensaje
              </Button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Información de Contacto
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <EnvelopeIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">contacto@proyectomercado.com</p>
                  <p className="text-gray-600">soporte@proyectomercado.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <PhoneIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Teléfono</h3>
                  <p className="text-gray-600">+591 2 1234567</p>
                  <p className="text-gray-600">+591 71234567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPinIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Dirección</h3>
                  <p className="text-gray-600">
                    Av. Principal 123<br />
                    La Paz, Bolivia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Horarios de Atención</h3>
                  <p className="text-gray-600">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Sábados: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 