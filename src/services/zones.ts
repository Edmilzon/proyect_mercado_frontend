import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import {
  ZonaEntrega,
  CreateZonaEntregaRequest,
  UpdateZonaEntregaRequest,
  CalcularTarifaRequest,
  TarifaCalculada,
  AsignarVendedorRequest,
  OptimizarRutaRequest,
  RutaOptimizada,
  Vendedor,
} from '@/types';

class ZonesService extends ApiService {
  // ===== ZONAS DE ENTREGA =====

  /**
   * Crear una nueva zona de entrega
   */
  async createZona(data: CreateZonaEntregaRequest): Promise<ZonaEntrega> {
    return this.post<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BASE, data);
  }

  /**
   * Obtener todas las zonas de entrega
   */
  async getZonas(): Promise<ZonaEntrega[]> {
    return this.get<ZonaEntrega[]>(API_ENDPOINTS.DELIVERY_ZONES.BASE);
  }

  /**
   * Obtener solo zonas activas
   */
  async getZonasActivas(): Promise<ZonaEntrega[]> {
    return this.get<ZonaEntrega[]>(API_ENDPOINTS.DELIVERY_ZONES.ACTIVE);
  }

  /**
   * Obtener zona por ID
   */
  async getZonaById(zonaId: string): Promise<ZonaEntrega> {
    return this.get<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zonaId));
  }

  /**
   * Actualizar zona de entrega
   */
  async updateZona(zonaId: string, data: UpdateZonaEntregaRequest): Promise<ZonaEntrega> {
    return this.put<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zonaId), data);
  }

  /**
   * Eliminar zona de entrega
   */
  async deleteZona(zonaId: string): Promise<void> {
    return this.delete(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zonaId));
  }

  // ===== CÁLCULO DE TARIFAS =====

  /**
   * Calcular tarifa de envío automáticamente
   */
  async calcularTarifa(data: CalcularTarifaRequest): Promise<TarifaCalculada> {
    return this.post<TarifaCalculada>(API_ENDPOINTS.DELIVERY_ZONES.CALCULATE_FEE, data);
  }

  /**
   * Calcular tarifa por coordenadas
   */
  async calcularTarifaPorCoordenadas(
    origen: { latitud: number; longitud: number },
    destino: { latitud: number; longitud: number },
    pesoTotalG: number,
    zonaId?: string
  ): Promise<TarifaCalculada> {
    const data: CalcularTarifaRequest = {
      latitud_origen: origen.latitud,
      longitud_origen: origen.longitud,
      latitud_destino: destino.latitud,
      longitud_destino: destino.longitud,
      peso_total_g: pesoTotalG,
      zona_id: zonaId,
    };

    return this.calcularTarifa(data);
  }

  // ===== ASIGNACIÓN DE VENDEDORES =====

  /**
   * Asignar vendedor a una zona
   */
  async asignarVendedor(vendedorId: string, data: AsignarVendedorRequest): Promise<void> {
    return this.post(API_ENDPOINTS.DELIVERY_ZONES.ASSIGN_SELLER(vendedorId), data);
  }

  /**
   * Remover vendedor de una zona
   */
  async removerVendedor(vendedorId: string): Promise<void> {
    return this.delete(API_ENDPOINTS.DELIVERY_ZONES.ASSIGN_SELLER(vendedorId));
  }

  /**
   * Obtener vendedores asignados a una zona
   */
  async getVendedoresByZona(zonaId: string): Promise<Vendedor[]> {
    return this.get<Vendedor[]>(API_ENDPOINTS.DELIVERY_ZONES.SELLERS_BY_ZONE(zonaId));
  }

  // ===== OPTIMIZACIÓN DE RUTAS =====

  /**
   * Optimizar ruta para un vendedor
   */
  async optimizarRuta(vendedorId: string, data: OptimizarRutaRequest): Promise<RutaOptimizada> {
    return this.post<RutaOptimizada>(API_ENDPOINTS.DELIVERY_ZONES.OPTIMIZE_ROUTE(vendedorId), data);
  }

  // ===== BÚSQUEDA POR COORDENADAS =====

  /**
   * Buscar zona por coordenadas
   */
  async buscarZonaPorCoordenadas(latitud: number, longitud: number): Promise<ZonaEntrega | null> {
    try {
      const params = new URLSearchParams({
        latitud: latitud.toString(),
        longitud: longitud.toString(),
      });

      const url = `${API_ENDPOINTS.DELIVERY_ZONES.SEARCH_BY_COORDINATES}?${params}`;
      return this.get<ZonaEntrega>(url);
    } catch (error) {
      console.error('Error searching zone by coordinates:', error);
      return null;
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Obtener zona más cercana a unas coordenadas
   */
  async getZonaMasCercana(latitud: number, longitud: number): Promise<ZonaEntrega | null> {
    try {
      // Primero intentar buscar por coordenadas exactas
      const zonaExacta = await this.buscarZonaPorCoordenadas(latitud, longitud);
      if (zonaExacta) return zonaExacta;

      // Si no hay zona exacta, obtener todas y calcular la más cercana
      const todasLasZonas = await this.getZonasActivas();
      
      if (todasLasZonas.length === 0) return null;

      // Calcular distancia a cada zona (simplificado)
      let zonaMasCercana = todasLasZonas[0];
      const centroZona0 = this.getCentroZona(todasLasZonas[0]);
      let distanciaMinima = this.calcularDistancia(
        latitud, longitud,
        centroZona0.latitud, centroZona0.longitud
      );

      for (const zona of todasLasZonas.slice(1)) {
        const centroZona = this.getCentroZona(zona);
        const distancia = this.calcularDistancia(
          latitud, longitud,
          centroZona.latitud, centroZona.longitud
        );

        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          zonaMasCercana = zona;
        }
      }

      return zonaMasCercana;
    } catch (error) {
      console.error('Error getting closest zone:', error);
      return null;
    }
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calcularDistancia(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtener centro de una zona (simplificado)
   */
  private getCentroZona(zona: ZonaEntrega): { latitud: number; longitud: number } {
    try {
      const poligono = JSON.parse(zona.coordenadas_poligono) as any;
      const coordenadas = poligono.coordinates[0];
      
      if (coordenadas && coordenadas.length > 0) {
        let latSum = 0;
        let lonSum = 0;
        
        for (const coord of coordenadas) {
          latSum += coord[1]; // latitud
          lonSum += coord[0]; // longitud
        }
        
        return {
          latitud: latSum / coordenadas.length,
          longitud: lonSum / coordenadas.length,
        };
      }
    } catch (error) {
      console.error('Error parsing zone coordinates:', error);
    }
    
    // Coordenadas por defecto (La Paz, Bolivia)
    return { latitud: -16.4897, longitud: -68.1193 };
  }

  /**
   * Verificar si un punto está dentro de una zona
   */
  async puntoEnZona(
    latitud: number,
    longitud: number,
    zonaId: string
  ): Promise<boolean> {
    try {
      const zona = await this.getZonaById(zonaId);
      const poligono = JSON.parse(zona.coordenadas_poligono) as any;
      
      // Implementación simplificada del algoritmo point-in-polygon
      // En producción, usar una librería como Turf.js
      return this.pointInPolygon([longitud, latitud], poligono.coordinates[0]);
    } catch (error) {
      console.error('Error checking if point is in zone:', error);
      return false;
    }
  }

  /**
   * Algoritmo point-in-polygon (Ray casting)
   */
  private pointInPolygon(point: number[], polygon: number[][]): boolean {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Obtener estadísticas de zonas
   */
  async getEstadisticasZonas(): Promise<{
    totalZonas: number;
    zonasActivas: number;
    zonasInactivas: number;
    vendedoresAsignados: number;
  }> {
    try {
      const [todasLasZonas, zonasActivas] = await Promise.all([
        this.getZonas(),
        this.getZonasActivas(),
      ]);

      let vendedoresAsignados = 0;
      for (const zona of todasLasZonas) {
        if (zona.vendedores) {
          vendedoresAsignados += zona.vendedores.length;
        }
      }

      return {
        totalZonas: todasLasZonas.length,
        zonasActivas: zonasActivas.length,
        zonasInactivas: todasLasZonas.length - zonasActivas.length,
        vendedoresAsignados,
      };
    } catch (error) {
      console.error('Error getting zone statistics:', error);
      return {
        totalZonas: 0,
        zonasActivas: 0,
        zonasInactivas: 0,
        vendedoresAsignados: 0,
      };
    }
  }
}

export const zonesService = new ZonesService(); 