import apiClient from '../client';
import { Product } from '@/types/product';
import { Product as ProductModel } from '@/models';

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/productos');
  return response.data.map(product => ProductModel.fromApi(product));
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/productos/${id}`);
  return ProductModel.fromApi(response.data);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(`/productos/search?q=${encodeURIComponent(query)}`);
  return response.data.map(product => ProductModel.fromApi(product));
};
