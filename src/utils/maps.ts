// Configuración y utilidades para Google Maps

export const GOOGLE_MAPS_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  DEFAULT_CENTER: { lat: -16.4897, lng: -68.1193 }, // La Paz, Bolivia
  DEFAULT_ZOOM: 13,
  MAP_STYLES: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Cargar Google Maps dinámicamente
export const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps solo está disponible en el cliente'));
      return;
    }

    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    
    document.head.appendChild(script);
  });
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
export const calcularDistancia = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Convertir grados a radianes
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Obtener ubicación actual del usuario
export const obtenerUbicacionActual = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Error de geolocalización: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// Formatear coordenadas para mostrar
export const formatearCoordenadas = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Validar coordenadas
export const validarCoordenadas = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Obtener dirección desde coordenadas (Geocoding)
export const obtenerDireccion = async (lat: number, lng: number): Promise<string> => {
  try {
    if (!window.google) {
      await loadGoogleMaps();
    }

    const geocoder = new window.google.maps.Geocoder();
    const response = await geocoder.geocode({ location: { lat, lng } });
    
    if (response.results.length > 0) {
      return response.results[0].formatted_address;
    }
    
    return 'Dirección no encontrada';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Error al obtener dirección';
  }
};

// Crear marcador en el mapa
export const crearMarcador = (
  map: google.maps.Map,
  position: { lat: number; lng: number },
  title?: string,
  icon?: string
): google.maps.Marker => {
  return new window.google.maps.Marker({
    position,
    map,
    title,
    icon: icon || undefined
  });
};

// Crear polígono en el mapa
export const crearPoligono = (
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[],
  options?: google.maps.PolygonOptions
): google.maps.Polygon => {
  return new window.google.maps.Polygon({
    paths,
    map,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.1,
    ...options
  });
};

// Dibujar ruta entre dos puntos
export const dibujarRuta = async (
  map: google.maps.Map,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
): Promise<google.maps.DirectionsRenderer> => {
  const directionsService = new window.google.maps.DirectionsService();
  const directionsRenderer = new window.google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true
  });

  const result = await directionsService.route({
    origin,
    destination,
    travelMode
  });

  directionsRenderer.setDirections(result);
  return directionsRenderer;
};

// Centrar mapa en ubicación
export const centrarMapa = (
  map: google.maps.Map,
  position: { lat: number; lng: number },
  zoom?: number
): void => {
  map.setCenter(position);
  if (zoom) {
    map.setZoom(zoom);
  }
};

// Limpiar marcadores del mapa
export const limpiarMarcadores = (markers: google.maps.Marker[]): void => {
  markers.forEach(marker => marker.setMap(null));
};

// Limpiar polígonos del mapa
export const limpiarPoligonos = (polygons: google.maps.Polygon[]): void => {
  polygons.forEach(polygon => polygon.setMap(null));
};

// Limpiar rutas del mapa
export const limpiarRutas = (renderers: google.maps.DirectionsRenderer[]): void => {
  renderers.forEach(renderer => renderer.setMap(null));
}; 