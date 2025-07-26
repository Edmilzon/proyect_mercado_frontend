import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { ZonaEntrega } from '@/types';

export interface ShippingCalculation {
  latitud_origen: number;
  longitud_origen: number;
  latitud_destino: number;
  longitud_destino: number;
  peso_total_g: number;
  zona_id: string;
}

export interface RouteOptimization {
  pedidos_ids: string[];
}

export class ZonesService extends ApiService {
  // Obtener todas las zonas de entrega
  async getZones(): Promise<ZonaEntrega[]> {
    try {
      const response = await this.get<ZonaEntrega[]>(API_ENDPOINTS.DELIVERY_ZONES.BASE);
      return response;
    } catch (error) {
      console.error('Error getting zones:', error);
      throw error;
    }
  }

  // Obtener solo zonas activas
  async getActiveZones(): Promise<ZonaEntrega[]> {
    try {
      const response = await this.get<ZonaEntrega[]>(API_ENDPOINTS.DELIVERY_ZONES.ACTIVE);
      return response;
    } catch (error) {
      console.error('Error getting active zones:', error);
      throw error;
    }
  }

  // Obtener zona por ID
  async getZoneById(zoneId: string): Promise<ZonaEntrega> {
    try {
      const response = await this.get<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zoneId));
      return response;
    } catch (error) {
      console.error('Error getting zone by ID:', error);
      throw error;
    }
  }

  // Crear nueva zona de entrega
  async createZone(zoneData: Partial<ZonaEntrega>): Promise<ZonaEntrega> {
    try {
      const response = await this.post<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BASE, zoneData);
      return response;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  // Actualizar zona de entrega
  async updateZone(zoneId: string, zoneData: Partial<ZonaEntrega>): Promise<ZonaEntrega> {
    try {
      const response = await this.put<ZonaEntrega>(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zoneId), zoneData);
      return response;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  // Eliminar zona de entrega
  async deleteZone(zoneId: string): Promise<void> {
    try {
      await this.delete(API_ENDPOINTS.DELIVERY_ZONES.BY_ID(zoneId));
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  // Calcular tarifa de envío automáticamente
  async calculateShippingFee(calculationData: ShippingCalculation): Promise<{ tarifa_envio: number }> {
    try {
      const response = await this.post<{ tarifa_envio: number }>(
        API_ENDPOINTS.DELIVERY_ZONES.CALCULATE_FEE, 
        calculationData
      );
      return response;
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      throw error;
    }
  }

  // Asignar vendedor a una zona
  async assignSellerToZone(sellerId: string, zoneId: string): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.DELIVERY_ZONES.ASSIGN_SELLER(sellerId), { zona_id: zoneId });
    } catch (error) {
      console.error('Error assigning seller to zone:', error);
      throw error;
    }
  }

  // Remover vendedor de una zona
  async removeSellerFromZone(sellerId: string): Promise<void> {
    try {
      await this.delete(API_ENDPOINTS.DELIVERY_ZONES.ASSIGN_SELLER(sellerId));
    } catch (error) {
      console.error('Error removing seller from zone:', error);
      throw error;
    }
  }

  // Obtener vendedores asignados a una zona
  async getSellersByZone(zoneId: string): Promise<unknown[]> {
    try {
      const response = await this.get<unknown[]>(API_ENDPOINTS.DELIVERY_ZONES.SELLERS_BY_ZONE(zoneId));
      return response;
    } catch (error) {
      console.error('Error getting sellers by zone:', error);
      throw error;
    }
  }

  // Optimizar ruta para un vendedor
  async optimizeRoute(sellerId: string, optimizationData: RouteOptimization): Promise<unknown> {
    try {
      const response = await this.post<unknown>(
        API_ENDPOINTS.DELIVERY_ZONES.OPTIMIZE_ROUTE(sellerId), 
        optimizationData
      );
      return response;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Buscar zona por coordenadas
  async findZoneByCoordinates(latitud: number, longitud: number): Promise<ZonaEntrega | null> {
    try {
      const params = new URLSearchParams();
      params.append('latitud', latitud.toString());
      params.append('longitud', longitud.toString());
      
      const response = await this.get<ZonaEntrega>(
        `${API_ENDPOINTS.DELIVERY_ZONES.SEARCH_BY_COORDINATES}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error finding zone by coordinates:', error);
      return null;
    }
  }
}

export const zonesService = new ZonesService(); 