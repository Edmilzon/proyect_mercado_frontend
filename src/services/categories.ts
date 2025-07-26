import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { CategoriaProducto } from '@/types';

export class CategoriesService extends ApiService {
  async getCategories(): Promise<CategoriaProducto[]> {
    try {
      const response = await this.get<{ categorias: CategoriaProducto[] }>(API_ENDPOINTS.CATEGORIES.BASE);
      return response.categorias;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async getParentCategories(): Promise<CategoriaProducto[]> {
    try {
      const response = await this.get<{ categorias: CategoriaProducto[] }>(API_ENDPOINTS.CATEGORIES.PARENTS);
      return response.categorias;
    } catch (error) {
      console.error('Error getting parent categories:', error);
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<CategoriaProducto> {
    try {
      const response = await this.get<{ categoria: CategoriaProducto }>(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));
      return response.categoria;
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw error;
    }
  }

  async createCategory(categoryData: {
    nombre: string;
    descripcion?: string;
    categoria_padre_id?: string;
  }): Promise<CategoriaProducto> {
    try {
      const response = await this.post<{ categoria: CategoriaProducto }>(API_ENDPOINTS.CATEGORIES.BASE, categoryData);
      return response.categoria;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService(); 