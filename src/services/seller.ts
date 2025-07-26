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
    const response = await this.get<{ vendedor: Vendedor }>(
      `${API_ENDPOINTS.SELLERS.BASE}/${sellerId}`
    );
    return response.vendedor;
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
    // Esta API necesitaría ser implementada en el backend
    // Por ahora retornamos datos simulados
    return {
      totalVentas: 150,
      ventasHoy: 3,
      productosActivos: 12,
      calificacionPromedio: 4.5
    };
  }
}

export const sellerService = new SellerService(); 