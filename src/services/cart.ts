import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { Producto } from '@/types';

export interface CartItem {
  producto_id: string;
  cantidad: number;
  producto?: Producto;
}

export interface CartSummary {
  subtotal: number;
  costo_envio: number;
  monto_descuento: number;
  monto_final: number;
  items: CartItem[];
}

export interface ShippingCalculation {
  subtotal: number;
  zona_id: string;
}

export interface DiscountCalculation {
  subtotal: number;
  codigo_descuento?: string;
}

export interface CompleteCartSummary {
  items: CartItem[];
  zona_id?: string;
  codigo_descuento?: string;
}

export class CartService extends ApiService {
  // Calcular totales del carrito
  async calculateCart(items: CartItem[]): Promise<CartSummary> {
    try {
      const response = await this.post<CartSummary>(API_ENDPOINTS.CART.CALCULATE, { items });
      return response;
    } catch (error) {
      console.error('Error calculating cart:', error);
      throw error;
    }
  }

  // Validar disponibilidad de stock
  async validateStock(items: CartItem[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await this.post<{ valid: boolean; errors: string[] }>(
        API_ENDPOINTS.CART.VALIDATE_STOCK, 
        { items }
      );
      return response;
    } catch (error) {
      console.error('Error validating stock:', error);
      throw error;
    }
  }

  // Calcular costo de envío
  async calculateShipping(subtotal: number, zonaId: string): Promise<{ costo_envio: number }> {
    try {
      const response = await this.get<{ costo_envio: number }>(
        `${API_ENDPOINTS.CART.CALCULATE_SHIPPING}?subtotal=${subtotal}&zona_id=${zonaId}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }

  // Calcular descuentos aplicables
  async calculateDiscounts(subtotal: number, codigoDescuento?: string): Promise<{ monto_descuento: number }> {
    try {
      const params = new URLSearchParams();
      params.append('subtotal', subtotal.toString());
      if (codigoDescuento) {
        params.append('codigo_descuento', codigoDescuento);
      }
      
      const response = await this.get<{ monto_descuento: number }>(
        `${API_ENDPOINTS.CART.CALCULATE_DISCOUNTS}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error calculating discounts:', error);
      throw error;
    }
  }

  // Resumen completo del carrito con envío y descuentos
  async getCompleteSummary(cartData: CompleteCartSummary): Promise<CartSummary> {
    try {
      const response = await this.post<CartSummary>(API_ENDPOINTS.CART.COMPLETE_SUMMARY, cartData);
      return response;
    } catch (error) {
      console.error('Error getting complete cart summary:', error);
      throw error;
    }
  }

  // Agregar producto al carrito (local storage)
  addToCart(productId: string, cantidad: number): void {
    try {
      const cartItems = this.getCartItems();
      const existingItem = cartItems.find(item => item.producto_id === productId);
      
      if (existingItem) {
        existingItem.cantidad += cantidad;
      } else {
        cartItems.push({ producto_id: productId, cantidad });
      }
      
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
      this.emitCartUpdate();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  // Remover producto del carrito
  removeFromCart(productId: string): void {
    try {
      const cartItems = this.getCartItems();
      const updatedItems = cartItems.filter(item => item.producto_id !== productId);
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));
      this.emitCartUpdate();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId: string, cantidad: number): void {
    try {
      const cartItems = this.getCartItems();
      const item = cartItems.find(item => item.producto_id === productId);
      
      if (item) {
        if (cantidad <= 0) {
          this.removeFromCart(productId);
        } else {
          item.cantidad = cantidad;
          localStorage.setItem('cart_items', JSON.stringify(cartItems));
          this.emitCartUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  // Obtener items del carrito
  getCartItems(): CartItem[] {
    try {
      const items = localStorage.getItem('cart_items');
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  // Limpiar carrito
  clearCart(): void {
    try {
      localStorage.removeItem('cart_items');
      this.emitCartUpdate();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Emitir evento de actualización del carrito
  private emitCartUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  // Obtener cantidad total de items
  getTotalItems(): number {
    const items = this.getCartItems();
    return items.reduce((total, item) => total + item.cantidad, 0);
  }

  // Verificar si el carrito está vacío
  isEmpty(): boolean {
    return this.getCartItems().length === 0;
  }
}

export const cartService = new CartService(); 