'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { sellerService } from '@/services/seller';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserIcon, 
  IdentificationIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function SellerOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    numero_identificacion: '',
    latitud_actual: -16.4897,
    longitud_actual: -68.1193,
    zona_asignada_id: ''
  });

  // Redirigir si no es vendedor
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol !== 'vendedor') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitud_actual: position.coords.latitude,
            longitud_actual: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('No se pudo obtener la ubicación automáticamente');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sellerService.registerSeller({
        vendedor_id: user!.usuario_id,
        numero_identificacion: formData.numero_identificacion,
        estado_onboarding: 'pendiente',
        latitud_actual: formData.latitud_actual,
        longitud_actual: formData.longitud_actual,
        zona_asignada_id: formData.zona_asignada_id || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Error al completar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Perfil Completado!</h2>
              <p className="text-gray-600 mb-4">
                Tu información ha sido enviada para revisión. Serás notificado cuando tu cuenta sea aprobada.
              </p>
              <div className="animate-pulse">
                <p className="text-sm text-blue-600">Redirigiendo al panel...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Completar Perfil de Vendedor</h1>
            </div>
            <p className="text-gray-600">
              Completa la información adicional requerida para activar tu cuenta de vendedor
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Identificación (CI)
                </label>
                <Input
                  type="text"
                  name="numero_identificacion"
                  value={formData.numero_identificacion}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  required

                />
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tu número de carnet de identidad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación Actual
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitud</label>
                    <Input
                      type="number"
                      name="latitud_actual"
                      value={formData.latitud_actual}
                      onChange={handleInputChange}
                      placeholder="Latitud"
                      step="any"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitud</label>
                    <Input
                      type="number"
                      name="longitud_actual"
                      value={formData.longitud_actual}
                      onChange={handleInputChange}
                      placeholder="Longitud"
                      step="any"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  Obtener ubicación automáticamente
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Esta información se usa para calcular tarifas de envío
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona de Entrega (Opcional)
                </label>
                <Input
                  type="text"
                  name="zona_asignada_id"
                  value={formData.zona_asignada_id}
                  onChange={handleInputChange}
                  placeholder="ID de zona (se asignará automáticamente)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si conoces tu zona de entrega, puedes especificarla
                </p>
              </div>

              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Información Importante
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tu información será revisada por nuestro equipo</li>
                  <li>• Recibirás una notificación cuando tu cuenta sea aprobada</li>
                  <li>• La ubicación se usa para calcular tarifas de envío</li>
                  <li>• Puedes actualizar tu información más tarde</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando información...' : 'Completar Perfil'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 