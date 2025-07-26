import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { DireccionUsuario } from '@/types';

export interface CreateAddressRequest {
  etiqueta: string;
  calle_avenida: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  pais: string;
  latitud: number;
  longitud: number;
  es_predeterminada: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}

export class AddressService extends ApiService {
  async getAddresses(userId: string): Promise<DireccionUsuario[]> {
    const response = await this.get<{ direcciones: DireccionUsuario[] }>(
      API_ENDPOINTS.USERS.ADDRESSES(userId)
    );
    return response.direcciones;
  }

  async createAddress(userId: string, addressData: CreateAddressRequest): Promise<DireccionUsuario> {
    const response = await this.post<{ direccion: DireccionUsuario }>(
      API_ENDPOINTS.USERS.ADDRESSES(userId),
      addressData
    );
    return response.direccion;
  }

  async updateAddress(userId: string, addressId: string, addressData: UpdateAddressRequest): Promise<DireccionUsuario> {
    const response = await this.put<{ direccion: DireccionUsuario }>(
      `${API_ENDPOINTS.USERS.ADDRESSES(userId)}/${addressId}`,
      addressData
    );
    return response.direccion;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.delete(`${API_ENDPOINTS.USERS.ADDRESSES(userId)}/${addressId}`);
  }
}

export const addressService = new AddressService(); 