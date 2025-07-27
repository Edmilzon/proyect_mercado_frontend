'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryMap } from './DeliveryMap';
import { Button } from '@/components/ui/Button';
import { 
  TrackingPedido, 
  TRACKING_STATUS,
  Coordenadas 
} from '@/types';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  PauseIcon,
  PhoneIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface OrderTrackingProps {
  pedidoId: string;
  onStatusChange?: (status: string) => void;
  onLocationUpdate?: (coords: Coordenadas) => void;
  className?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  pedidoId,
  onStatusChange,
  onLocationUpdate,
  className = ''
}) => {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<TrackingPedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState<Coordenadas | null>(null);
  
  // Referencias para tracking
  const trackingIntervalRef = useRef<NodeJS.Timeout>();
  const watchIdRef = useRef<number>();

  // Simular datos de tracking (en producción vendría de la API)
  const simularTrackingData = (): TrackingPedido => {
    return {
      pedido_id: pedidoId,
      estado: TRACKING_STATUS.EN_RUTA,
      ubicacion_actual: {
        latitud: -16.4897,
        longitud: -68.1193,
        timestamp: new Date().toISOString(),
        precision_m: 10
      },
      ubicacion_destino: {
        latitud: -16.5000,
        longitud: -68.1300,
        direccion: 'Av. 16 de Julio, La Paz, Bolivia'
      },
      tiempo_estimado_llegada: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      vendedor: {
        vendedor_id: 'vendedor-1',
        numero_identificacion: '12345678',
        estado_onboarding: 'aprobado',
        calificacion_promedio: 4.5,
        total_resenas: 25,
        tasa_comision: 0.10,
        creado_at: new Date().toISOString(),
        actualizado_at: new Date().toISOString(),
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@gmail.com',
        numero_telefono: '71234567',
        rol: 'vendedor',
        esta_activo: true
      },
      historial_ubicaciones: [
        {
          latitud: -16.4897,
          longitud: -68.1193,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          precision_m: 10
        }
      ]
    };
  };

  // Cargar datos de tracking
  const cargarTrackingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular carga de datos (en producción sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = simularTrackingData();
      setTrackingData(data);
      
      if (data.ubicacion_actual) {
        setUbicacionActual({
          latitud: data.ubicacion_actual.latitud,
          longitud: data.ubicacion_actual.longitud
        });
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setError('Error al cargar los datos de tracking');
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar tracking en tiempo real
  const iniciarTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      return;
    }

    setIsTrackingActive(true);

    // Obtener ubicación inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordenadas = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        };
        setUbicacionActual(coords);
        onLocationUpdate?.(coords);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Error al obtener ubicación');
      }
    );

    // Configurar tracking continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordenadas = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        };
        setUbicacionActual(coords);
        onLocationUpdate?.(coords);
        
        // Actualizar historial
        if (trackingData) {
          setTrackingData(prev => prev ? {
            ...prev,
            ubicacion_actual: {
              ...coords,
              timestamp: new Date().toISOString(),
              precision_m: position.coords.accuracy || 10
            },
            historial_ubicaciones: [
              ...prev.historial_ubicaciones,
              {
                ...coords,
                timestamp: new Date().toISOString(),
                precision_m: position.coords.accuracy || 10
              }
            ]
          } : null);
        }
      },
      (error) => {
        console.error('Error tracking location:', error);
        setError('Error en el tracking de ubicación');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  };

  // Detener tracking
  const detenerTracking = () => {
    setIsTrackingActive(false);
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }
  };

  // Actualizar estado del pedido
  const actualizarEstado = async (nuevoEstado: string) => {
    try {
      // Aquí iría la llamada a la API para actualizar el estado
      setTrackingData(prev => prev ? { ...prev, estado: nuevoEstado as any } : null);
      onStatusChange?.(nuevoEstado);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Error al actualizar el estado del pedido');
    }
  };

  // Calcular tiempo restante
  const calcularTiempoRestante = (): string => {
    if (!trackingData?.tiempo_estimado_llegada) return 'No disponible';
    
    const ahora = new Date();
    const llegada = new Date(trackingData.tiempo_estimado_llegada);
    const diferencia = llegada.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Llegando...';
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos % 60}m`;
    } else {
      return `${minutos}m`;
    }
  };

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case TRACKING_STATUS.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800';
      case TRACKING_STATUS.CONFIRMADO:
        return 'bg-blue-100 text-blue-800';
      case TRACKING_STATUS.EN_PREPARACION:
        return 'bg-orange-100 text-orange-800';
      case TRACKING_STATUS.EN_RUTA:
        return 'bg-purple-100 text-purple-800';
      case TRACKING_STATUS.ENTREGADO:
        return 'bg-green-100 text-green-800';
      case TRACKING_STATUS.CANCELADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case TRACKING_STATUS.ENTREGADO:
        return <CheckCircleIcon className="w-5 h-5" />;
      case TRACKING_STATUS.CANCELADO:
        return <ExclamationCircleIcon className="w-5 h-5" />;
      default:
        return <TruckIcon className="w-5 h-5" />;
    }
  };

  // Efectos
  useEffect(() => {
    cargarTrackingData();
  }, [pedidoId]);

  useEffect(() => {
    return () => {
      detenerTracking();
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={cargarTrackingData} size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <TruckIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron datos de tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del tracking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tracking del Pedido</h2>
            <p className="text-gray-600">Pedido #{pedidoId.slice(0, 8)}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(trackingData.estado)}`}>
              {getEstadoIcon(trackingData.estado)}
              <span className="ml-1 capitalize">{trackingData.estado.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Información del vendedor */}
        {trackingData.vendedor && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {trackingData.vendedor.nombre} {trackingData.vendedor.apellido}
                </p>
                <p className="text-sm text-gray-500">{trackingData.vendedor.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <PhoneIcon className="w-4 h-4 mr-1" />
                Llamar
              </Button>
              <Button size="sm" variant="outline">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        )}

        {/* Información de tiempo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Tiempo estimado</p>
              <p className="font-medium text-gray-900">{calcularTiempoRestante()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <MapPinIcon className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Destino</p>
              <p className="font-medium text-gray-900">La Paz, Bolivia</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <TruckIcon className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium text-gray-900 capitalize">
                {trackingData.estado.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de tracking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ubicación en Tiempo Real</h3>
          
          <div className="flex items-center space-x-2">
            {isTrackingActive ? (
              <Button
                onClick={detenerTracking}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <PauseIcon className="w-4 h-4 mr-1" />
                Detener Tracking
              </Button>
            ) : (
              <Button
                onClick={iniciarTracking}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlayIcon className="w-4 h-4 mr-1" />
                Iniciar Tracking
              </Button>
            )}
          </div>
        </div>
        
        <DeliveryMap
          pedidoId={pedidoId}
          modoVendedor={user?.rol === 'vendedor'}
          className="h-96"
        />
      </div>

      {/* Historial de ubicaciones */}
      {trackingData.historial_ubicaciones.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Ubicaciones</h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {trackingData.historial_ubicaciones.slice(-10).reverse().map((ubicacion, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ubicacion.latitud.toFixed(6)}, {ubicacion.longitud.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(ubicacion.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs text-gray-500">
                  ±{ubicacion.precision_m}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles de estado (solo para vendedores) */}
      {user?.rol === 'vendedor' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actualizar Estado</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(TRACKING_STATUS).map((estado) => (
              <Button
                key={estado}
                onClick={() => actualizarEstado(estado)}
                variant={trackingData.estado === estado ? "default" : "outline"}
                size="sm"
                className={trackingData.estado === estado ? "bg-blue-600 text-white" : ""}
              >
                {estado.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 