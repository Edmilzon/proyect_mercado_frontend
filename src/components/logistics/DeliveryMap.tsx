'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { zonesService } from '@/services/zones';
import { 
  ZonaEntrega, 
  TrackingPedido, 
  RutaOptimizada,
  Coordenadas,
  TRACKING_STATUS 
} from '@/types';
import { Button } from '@/components/ui/Button';
import {
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DeliveryMapProps {
  pedidoId?: string;
  onTarifaCalculada?: (tarifa: number) => void;
  onZonaSeleccionada?: (zona: ZonaEntrega) => void;
  modoVendedor?: boolean;
  className?: string;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  pedidoId,
  onTarifaCalculada,
  onZonaSeleccionada,
  modoVendedor = false,
  className = ''
}) => {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [rutas, setRutas] = useState<any[]>([]);
  
  // Estados del mapa
  const [ubicacionActual, setUbicacionActual] = useState<Coordenadas | null>(null);
  const [ubicacionDestino, setUbicacionDestino] = useState<Coordenadas | null>(null);
  const [zonas, setZonas] = useState<ZonaEntrega[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaEntrega | null>(null);
  const [trackingActivo, setTrackingActivo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de tracking
  const [tiempoEstimado, setTiempoEstimado] = useState<number | null>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [historialUbicaciones, setHistorialUbicaciones] = useState<Coordenadas[]>([]);
  
  // Referencias para tracking
  const trackingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const watchIdRef = useRef<number | undefined>(undefined);

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        // Cargar Google Maps dinámicamente
        if (typeof window !== 'undefined' && !window.google) {
          await loadGoogleMaps();
        }

        if (mapRef.current && window.google) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: -16.4897, lng: -68.1193 }, // La Paz, Bolivia
            zoom: 13,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          setMap(mapInstance);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Error al cargar el mapa');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Cargar Google Maps
  const loadGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      
      document.head.appendChild(script);
    });
  };

  // Obtener ubicación actual
  const obtenerUbicacionActual = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const coords: Coordenadas = {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      };

      setUbicacionActual(coords);
      return coords;
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Error al obtener ubicación actual');
      return null;
    }
  }, []);

  // Cargar zonas
  const cargarZonas = useCallback(async () => {
    try {
      const zonasData = await zonesService.getZonasActivas();
      setZonas(zonasData);
      dibujarZonas(zonasData);
    } catch (error) {
      console.error('Error loading zones:', error);
      setError('Error al cargar zonas de entrega');
    }
  }, []);

  // Dibujar zonas en el mapa
  const dibujarZonas = useCallback((zonasData: ZonaEntrega[]) => {
    if (!map) return;

    // Limpiar polígonos existentes
    polygons.forEach(polygon => polygon.setMap(null));
    const nuevosPolygons: any[] = [];

    zonasData.forEach(zona => {
      try {
        const poligonoData = JSON.parse(zona.coordenadas_poligono);
        const coordenadas = poligonoData.coordinates[0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const polygon = new window.google.maps.Polygon({
          paths: coordenadas,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.1,
          map: map
        });

        // Agregar evento de clic
        window.google.maps.event.addListener(polygon, 'click', () => {
          setZonaSeleccionada(zona);
          onZonaSeleccionada?.(zona);
        });

        nuevosPolygons.push(polygon);
      } catch (error) {
        console.error('Error drawing zone:', error);
      }
    });

    setPolygons(nuevosPolygons);
  }, [map, onZonaSeleccionada]);

  // Agregar marcador
  const agregarMarcador = useCallback((coords: Coordenadas, titulo: string, icon?: string) => {
    if (!map) return null;

    const marker = new window.google.maps.Marker({
      position: { lat: coords.latitud, lng: coords.longitud },
      map: map,
      title: titulo,
      icon: icon || undefined
    });

    setMarkers(prev => [...prev, marker]);
    return marker;
  }, [map]);

  // Limpiar marcadores
  const limpiarMarcadores = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [markers]);

  // Dibujar ruta
  const dibujarRuta = useCallback(async (origen: Coordenadas, destino: Coordenadas) => {
    if (!map || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true
    });

    try {
      // Simular ruta por ahora (en producción usaría la API real)
      const distanciaCalculada = Math.sqrt(
        Math.pow(destino.latitud - origen.latitud, 2) + 
        Math.pow(destino.longitud - origen.longitud, 2)
      ) * 111; // Aproximación en km
      
      setDistancia(distanciaCalculada);
      setTiempoEstimado(distanciaCalculada * 2); // 2 min por km

      setRutas(prev => [...prev, directionsRenderer]);
    } catch (error) {
      console.error('Error drawing route:', error);
    }
  }, [map]);

  // Calcular tarifa
  const calcularTarifa = useCallback(async () => {
    if (!ubicacionActual || !ubicacionDestino) return;

    try {
      const tarifa = await zonesService.calcularTarifaPorCoordenadas(
        ubicacionActual,
        ubicacionDestino,
        1000, // peso por defecto
        zonaSeleccionada?.zona_id
      );

      onTarifaCalculada?.(tarifa.tarifa_final);
    } catch (error) {
      console.error('Error calculating fee:', error);
    }
  }, [ubicacionActual, ubicacionDestino, zonaSeleccionada, onTarifaCalculada]);

  // Iniciar tracking
  const iniciarTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      return;
    }

    setTrackingActivo(true);

    // Obtener ubicación inicial
    obtenerUbicacionActual();

    // Configurar tracking continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordenadas = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        };

        setUbicacionActual(coords);
        setHistorialUbicaciones(prev => [...prev, coords]);

        // Actualizar marcador de ubicación actual
        limpiarMarcadores();
        agregarMarcador(coords, 'Tu ubicación', '/truck-icon.png');
        
        if (ubicacionDestino) {
          dibujarRuta(coords, ubicacionDestino);
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
  }, [obtenerUbicacionActual, limpiarMarcadores, agregarMarcador, dibujarRuta, ubicacionDestino]);

  // Detener tracking
  const detenerTracking = useCallback(() => {
    setTrackingActivo(false);
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }
  }, []);

  // Centrar mapa en ubicación actual
  const centrarEnUbicacionActual = useCallback(async () => {
    const coords = await obtenerUbicacionActual();
    if (coords && map) {
      map.setCenter({ lat: coords.latitud, lng: coords.longitud });
      map.setZoom(15);
    }
  }, [obtenerUbicacionActual, map]);

  // Efectos
  useEffect(() => {
    if (map) {
      cargarZonas();
      obtenerUbicacionActual();
    }
  }, [map, cargarZonas, obtenerUbicacionActual]);

  useEffect(() => {
    if (ubicacionActual && ubicacionDestino) {
      calcularTarifa();
    }
  }, [ubicacionActual, ubicacionDestino, calcularTarifa]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      detenerTracking();
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [detenerTracking]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Controles del mapa */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <Button
          onClick={centrarEnUbicacionActual}
          size="sm"
          variant="outline"
          className="bg-white shadow-md"
        >
          <MapPinIcon className="w-4 h-4 mr-1" />
          Mi Ubicación
        </Button>

        {modoVendedor && (
          <Button
            onClick={trackingActivo ? detenerTracking : iniciarTracking}
            size="sm"
            variant={trackingActivo ? "outline" : "default"}
            className={`shadow-md ${trackingActivo ? 'bg-white' : 'bg-blue-600 text-white'}`}
          >
            {trackingActivo ? (
              <>
                <PauseIcon className="w-4 h-4 mr-1" />
                Detener
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-1" />
                Iniciar Tracking
              </>
            )}
          </Button>
        )}
      </div>

      {/* Información de ruta */}
      {(distancia || tiempoEstimado) && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center space-x-4">
            {distancia && (
              <div className="flex items-center">
                <TruckIcon className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium">{distancia.toFixed(1)} km</span>
              </div>
            )}
            {tiempoEstimado && (
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium">{Math.round(tiempoEstimado)} min</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zona seleccionada */}
      {zonaSeleccionada && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-xs">
          <h3 className="font-medium text-gray-900 mb-1">{zonaSeleccionada.nombre}</h3>
          <p className="text-sm text-gray-600 mb-2">{zonaSeleccionada.descripcion}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tarifa:</span>
            <span className="font-medium text-green-600">Bs. {zonaSeleccionada.tarifa_envio}</span>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg shadow-md"
        style={{ minHeight: '400px' }}
      />

      {/* Estado de tracking */}
      {trackingActivo && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Tracking activo</span>
            </div>
            <span className="text-xs text-blue-600">
              {historialUbicaciones.length} ubicaciones registradas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 