import { ApiService } from './api';
import { Vendedor, CreateVendedorRequest } from '@/types';

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

class SellerService extends ApiService {
  /**
   * Registrar datos extra de vendedor (API 5)
   */
  async registerSeller(data: CreateVendedorRequest): Promise<Vendedor> {
    return this.post('/vendedores', data);
  }

  /**
   * Listar todos los vendedores (API 6) - Para administradores
   */
  async getAllSellers(): Promise<Vendedor[]> {
    return this.get('/vendedores');
  }

  /**
   * Obtener vendedor por ID
   */
  async getSellerById(sellerId: string): Promise<Vendedor> {
    return this.get(`/vendedores/${sellerId}`);
  }

  /**
   * Actualizar estado de onboarding de vendedor
   */
  async updateSellerStatus(sellerId: string, status: 'pendiente' | 'aprobado' | 'rechazado'): Promise<Vendedor> {
    return this.patch(`/vendedores/${sellerId}/status`, { estado_onboarding: status });
  }

  /**
   * Registrar ubicación de vendedor (API 7)
   */
  async updateSellerLocation(data: {
    vendedor_id: string;
    latitud: number;
    longitud: number;
    precision_m: number;
  }): Promise<void> {
    return this.post('/vendedores/ubicaciones', data);
  }

  /**
   * Obtener ubicaciones históricas de vendedor (API 8)
   */
  async getSellerLocations(sellerId: string): Promise<any[]> {
    return this.get(`/vendedores/${sellerId}/ubicaciones`);
  }

  /**
   * Obtener estadísticas de vendedores
   */
  async getSellerStats(): Promise<{
    total: number;
    aprobados: number;
    pendientes: number;
    rechazados: number;
  }> {
    const sellers = await this.getAllSellers();
    return {
      total: sellers.length,
      aprobados: sellers.filter(s => s.estado_onboarding === 'aprobado').length,
      pendientes: sellers.filter(s => s.estado_onboarding === 'pendiente').length,
      rechazados: sellers.filter(s => s.estado_onboarding === 'rechazado').length,
    };
  }
}

export const sellerService = new SellerService(); 