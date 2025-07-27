import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { 
  Resena, 
  CreateResenaRequest, 
  UpdateResenaRequest, 
  ResponderResenaRequest, 
  CalificacionVendedor, 
  ResenaFilters 
} from '@/types';

export class ReviewsService extends ApiService {
  /**
   * Crear una nueva reseña
   */
  async createReview(reviewData: CreateResenaRequest): Promise<Resena> {
    try {
      const response = await this.post<{ resena: Resena }>(API_ENDPOINTS.REVIEWS.BASE, reviewData);
      return response.resena;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las reseñas
   */
  async getReviews(): Promise<Resena[]> {
    try {
      const response = await this.get<{ resenas: Resena[] }>(API_ENDPOINTS.REVIEWS.BASE);
      return response.resenas;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  /**
   * Buscar reseñas con filtros
   */
  async searchReviews(filters: ResenaFilters): Promise<Resena[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.vendedor_id) queryParams.append('vendedor_id', filters.vendedor_id);
      if (filters.comprador_id) queryParams.append('comprador_id', filters.comprador_id);
      if (filters.calificacion) queryParams.append('calificacion', filters.calificacion.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());

      const url = `${API_ENDPOINTS.REVIEWS.SEARCH}?${queryParams.toString()}`;
      const response = await this.get<{ resenas: Resena[] }>(url);
      return response.resenas;
    } catch (error) {
      console.error('Error searching reviews:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas de un vendedor específico
   */
  async getSellerReviews(sellerId: string): Promise<Resena[]> {
    try {
      const response = await this.get<{ resenas: Resena[] }>(API_ENDPOINTS.REVIEWS.BY_SELLER(sellerId));
      return response.resenas;
    } catch (error) {
      console.error('Error getting seller reviews:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas de un comprador específico
   */
  async getBuyerReviews(buyerId: string): Promise<Resena[]> {
    try {
      const response = await this.get<{ resenas: Resena[] }>(API_ENDPOINTS.REVIEWS.BY_BUYER(buyerId));
      return response.resenas;
    } catch (error) {
      console.error('Error getting buyer reviews:', error);
      throw error;
    }
  }

  /**
   * Obtener pedidos entregados sin reseña
   */
  async getPendingReviews(buyerId: string): Promise<any[]> {
    try {
      const response = await this.get<{ pedidos: any[] }>(API_ENDPOINTS.REVIEWS.PENDING(buyerId));
      return response.pedidos;
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw error;
    }
  }

  /**
   * Obtener reseña por ID
   */
  async getReviewById(reviewId: string): Promise<Resena> {
    try {
      const response = await this.get<{ resena: Resena }>(API_ENDPOINTS.REVIEWS.BY_ID(reviewId));
      return response.resena;
    } catch (error) {
      console.error('Error getting review by ID:', error);
      throw error;
    }
  }

  /**
   * Responder a una reseña (solo vendedor)
   */
  async respondToReview(reviewId: string, responseData: ResponderResenaRequest): Promise<Resena> {
    try {
      const response = await this.put<{ resena: Resena }>(API_ENDPOINTS.REVIEWS.RESPOND(reviewId), responseData);
      return response.resena;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  }

  /**
   * Actualizar reseña (solo comprador)
   */
  async updateReview(reviewId: string, updateData: UpdateResenaRequest): Promise<Resena> {
    try {
      const response = await this.put<{ resena: Resena }>(API_ENDPOINTS.REVIEWS.BY_ID(reviewId), updateData);
      return response.resena;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Eliminar reseña (solo comprador o admin)
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await this.delete(API_ENDPOINTS.REVIEWS.BY_ID(reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Obtener calificación detallada de un vendedor
   */
  async getSellerRating(sellerId: string): Promise<CalificacionVendedor | null> {
    try {
      console.log('Fetching seller rating for:', sellerId);
      console.log('URL:', API_ENDPOINTS.REVIEWS.SELLER_RATING(sellerId));
      
      const response = await this.get<{ calificacion: CalificacionVendedor }>(API_ENDPOINTS.REVIEWS.SELLER_RATING(sellerId));
      console.log('Seller rating response:', response);
      return response.calificacion;
    } catch (error: any) {
      console.error('Error getting seller rating:', error);
      
      // Si es error 500, el endpoint tiene problemas en el backend
      if (error?.response?.status === 500) {
        console.log('Backend error 500 - endpoint needs fixing');
        return null;
      }
      
      // Para otros errores, también retornar null
      return null;
    }
  }
}

export const reviewsService = new ReviewsService(); 