import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { Producto } from '@/types';
import { ImagenProducto } from '@/types';

export class ProductsService extends ApiService {
  async getProducts(): Promise<Producto[]> {
    try {
      const response = await this.get<{ productos: Producto[] }>(API_ENDPOINTS.PRODUCTS.BASE);
      return response.productos;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Producto> {
    try {
      const response = await this.get<{ producto: Producto }>(API_ENDPOINTS.PRODUCTS.BY_ID(productId));
      return response.producto;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Producto[]> {
    try {
      const response = await this.get<{ productos: Producto[] }>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`);
      return response.productos;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async createProduct(productData: {
    nombre: string;
    descripcion?: string;
    precio_base: number;
    precio_actual: number;
    categoria_id: string;
    cantidad_stock: number;
    url_imagen_principal?: string;
    esta_activo: boolean;
    sku: string;
    peso_g?: number;
  }): Promise<Producto> {
    try {
      const response = await this.post<{ producto: Producto }>(API_ENDPOINTS.PRODUCTS.BASE, productData);
      return response.producto;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, productData: Partial<Producto>): Promise<Producto> {
    try {
      const response = await this.put<{ producto: Producto }>(API_ENDPOINTS.PRODUCTS.BY_ID(productId), productData);
      return response.producto;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.delete(API_ENDPOINTS.PRODUCTS.BY_ID(productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateStock(productId: string, cantidad: number): Promise<void> {
    try {
      await this.put(API_ENDPOINTS.PRODUCTS.STOCK(productId), { cantidad_stock: cantidad });
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  async addProductImage(productId: string, imageData: {
    url_imagen: string;
    orden_indice: number;
  }): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.PRODUCTS.IMAGES(productId), imageData);
    } catch (error) {
      console.error('Error adding product image:', error);
      throw error;
    }
  }

  async getProductImages(productId: string): Promise<ImagenProducto[]> {
    try {
      const response = await this.get<{ imagenes: ImagenProducto[] }>(API_ENDPOINTS.PRODUCTS.IMAGES(productId));
      return response.imagenes || [];
    } catch (error) {
      console.error('Error getting product images:', error);
      return [];
    }
  }
}

export const productsService = new ProductsService(); 