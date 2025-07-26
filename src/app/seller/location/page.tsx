'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { sellerService } from '@/services/seller';
import { formatCoordinate } from '@/utils/cn';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface LocationData {
  latitud: number;
  longitud: number;
  precision_m: number;
  timestamp: string;
}

export default function LocationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);

  // Redirigir si no está autenticado o no es vendedor
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.rol !== 'vendedor') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const updateLocation = async () => {
    setIsUpdating(true);
    try {
      const position = await getCurrentLocation();
      const newLocation: LocationData = {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
        precision_m: position.coords.accuracy || 0,
        timestamp: new Date().toISOString()
      };

      setCurrentLocation(newLocation);

      // Llamada a la API para actualizar la ubicación
      if (!user?.usuario_id) {
        throw new Error('Usuario no identificado');
      }
      
      await sellerService.updateLocation({
        vendedor_id: user.usuario_id,
        latitud: newLocation.latitud,
        longitud: newLocation.longitud,
        precision_m: newLocation.precision_m
      });

      // Envío por WebSocket para tiempo real
      try {
        const ws = new WebSocket('wss://proyect-mercado-backend.fly.dev');
        ws.onopen = () => {
          ws.send(JSON.stringify({
            event: 'ubicacion_actualizada',
            data: {
              vendedor_id: user?.usuario_id,
              latitud: newLocation.latitud,
              longitud: newLocation.longitud,
              precision_m: newLocation.precision_m
            }
          }));
          ws.close();
        };
      } catch (wsError) {
        console.warn('WebSocket no disponible:', wsError);
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);

      // Agregar a historial
      setLocationHistory(prev => [newLocation, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error al obtener la ubicación. Asegúrate de permitir el acceso a la ubicación.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los vendedores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/seller/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Ubicación</h1>
            </div>
            <p className="text-gray-600">
              Actualiza tu ubicación en tiempo real para mejorar la experiencia de entrega
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  Ubicación actualizada exitosamente
                </p>
              </div>
            </div>
          )}

          {/* Current Location Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación Actual</h3>
            
            {currentLocation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                                              <span className="text-gray-900">{formatCoordinate(currentLocation.latitud, 6)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                                              <span className="text-gray-900">{formatCoordinate(currentLocation.longitud, 6)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precisión
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                                              <span className="text-gray-900">±{formatCoordinate(currentLocation.precision_m, 1)} metros</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Última Actualización
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{formatTimestamp(currentLocation.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={updateLocation}
                    loading={isUpdating}
                    disabled={isUpdating}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Actualizando...' : 'Actualizar Ubicación'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay ubicación registrada</p>
                <Button
                  onClick={updateLocation}
                  loading={isUpdating}
                  disabled={isUpdating}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Obtener Ubicación Actual
                </Button>
              </div>
            )}
          </div>

          {/* Location History */}
          {locationHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Ubicaciones</h3>
              
              <div className="space-y-3">
                {locationHistory.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCoordinate(location.latitud, 6)}, {formatCoordinate(location.longitud, 6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Precisión: ±{formatCoordinate(location.precision_m, 1)}m
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(location.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Información Importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tu ubicación se actualiza automáticamente cuando los clientes realizan pedidos</li>
              <li>• La precisión depende de tu dispositivo y conexión GPS</li>
              <li>• Puedes actualizar manualmente tu ubicación en cualquier momento</li>
              <li>• Los administradores pueden ver tu ubicación en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 