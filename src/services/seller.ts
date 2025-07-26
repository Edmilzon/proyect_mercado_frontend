import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { Vendedor } from '@/types';

export interface UpdateLocationRequest {
  vendedor_id: string;
  latitud: number;
  longitud: number;
  precision_m: number;
}

export interface SellerStats {
  totalVentas: number;
  ventasHoy: number;
  productosActivos: number;
  calificacionPromedio: number;
}

export class SellerService extends ApiService {
  async getSellerData(sellerId: string): Promise<Vendedor> {
    try {
      const response = await this.get<{ vendedores: Vendedor[] }>(API_ENDPOINTS.SELLERS.BASE);
      
      // Buscar el vendedor que coincida con el usuario_id
      const vendedor = response.vendedores.find(v => v.usuario?.usuario_id === sellerId);
      
      if (vendedor) {
        return vendedor;
      }
      
      // Si no existe, crear un vendedor con datos básicos
      return {
        vendedor_id: sellerId,
        numero_identificacion: '',
        estado_onboarding: 'pendiente',
        calificacion_promedio: 0,
        total_resenas: 0,
        tasa_comision: 0.05,
        creado_at: new Date().toISOString(),
        actualizado_at: new Date().toISOString(),
        usuario: undefined
      };
    } catch (error) {
      console.error('Error getting seller data:', error);
      throw error;
    }
  }

  async registerSellerData(sellerData: {
    vendedor_id: string;
    numero_identificacion: string;
    estado_onboarding?: string;
    latitud_actual?: number;
    longitud_actual?: number;
    zona_asignada_id?: string;
  }): Promise<Vendedor> {
    const response = await this.post<Vendedor>(API_ENDPOINTS.SELLERS.BASE, sellerData);
    return response;
  }

  async updateLocation(locationData: UpdateLocationRequest): Promise<void> {
    await this.post(API_ENDPOINTS.SELLERS.LOCATIONS, locationData);
  }

  async getLocationHistory(sellerId: string): Promise<any[]> {
    const response = await this.get<any[]>(
      API_ENDPOINTS.SELLERS.LOCATIONS_BY_ID(sellerId)
    );
    return response;
  }

  async getSellerStats(sellerId: string): Promise<SellerStats> {
    try {
      // TODO: Implementar endpoint de estadísticas del vendedor
      // Por ahora retornamos datos vacíos hasta que se implemente la API
      return {
        totalVentas: 0,
        ventasHoy: 0,
        productosActivos: 0,
        calificacionPromedio: 0
      };
    } catch (error) {
      console.error('Error getting seller stats:', error);
      throw error;
    }
  }
}

export const sellerService = new SellerService(); 