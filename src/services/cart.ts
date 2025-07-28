import { ApiService } from './api';

// Interfaces para el carrito
export interface CartItem {
  producto_id: string;
  cantidad: number;
}

export interface CartCalculationRequest {
  items: CartItem[];
}

export interface CartCalculationResponse {
  subtotal: number;
  total: number;
  items_count: number;
}

export interface CartStockValidationRequest {
  items: CartItem[];
}

export interface CartStockValidationResponse {
  items_validos: boolean;
  items_sin_stock: CartItem[];
  mensaje?: string;
}

export interface CartShippingRequest {
  subtotal: number;
  zona_id: string;
}

export interface CartShippingResponse {
  costo_envio: number;
  zona_nombre: string;
  tiempo_estimado: string;
}

export interface CartDiscountRequest {
  subtotal: number;
  codigo_descuento: string;
}

export interface CartDiscountResponse {
  codigo_valido: boolean;
  monto_descuento: number;
  porcentaje_descuento: number;
  descripcion: string;
}

export interface CartCompleteSummaryRequest {
  items: CartItem[];
  zona_id?: string;
  codigo_descuento?: string;
}

export interface CartCompleteSummaryResponse {
  subtotal: number;
  costo_envio: number;
  monto_descuento: number;
  total: number;
  items_count: number;
  zona_info?: {
    zona_id: string;
    zona_nombre: string;
    tiempo_estimado: string;
  };
  descuento_info?: {
    codigo: string;
    porcentaje: number;
    descripcion: string;
  };
  items_detalles: Array<{
    producto_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    stock_disponible: number;
  }>;
}

class CartService extends ApiService {
  // Calcular totales del carrito
  async calculateCart(request: CartCalculationRequest): Promise<CartCalculationResponse> {
    return this.post<CartCalculationResponse>('/carrito/calcular', request);
  }

  // Validar disponibilidad de stock
  async validateStock(request: CartStockValidationRequest): Promise<CartStockValidationResponse> {
    return this.post<CartStockValidationResponse>('/carrito/validar-stock', request);
  }

  // Calcular costo de envío
  async calculateShipping(subtotal: number, zona_id: string): Promise<CartShippingResponse> {
    return this.get<CartShippingResponse>(`/carrito/calcular-envio?subtotal=${subtotal}&zona_id=${zona_id}`);
  }

  // Calcular descuentos aplicables
  async calculateDiscount(subtotal: number, codigo_descuento: string): Promise<CartDiscountResponse> {
    return this.get<CartDiscountResponse>(`/carrito/calcular-descuentos?subtotal=${subtotal}&codigo_descuento=${codigo_descuento}`);
  }

  // Resumen completo del carrito
  async getCompleteSummary(request: CartCompleteSummaryRequest): Promise<CartCompleteSummaryResponse> {
    return this.post<CartCompleteSummaryResponse>('/carrito/resumen-completo', request);
  }

  // Métodos locales para localStorage
  getCartItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem('cart_items');
    return items ? JSON.parse(items) : [];
  }

  addToCart(productId: string, quantity: number = 1): void {
    const items = this.getCartItems();
    const existingItem = items.find(item => item.producto_id === productId);
    
    if (existingItem) {
      existingItem.cantidad += quantity;
    } else {
      items.push({ producto_id: productId, cantidad: quantity });
    }
    
    localStorage.setItem('cart_items', JSON.stringify(items));
  }

  updateQuantity(productId: string, quantity: number): void {
    const items = this.getCartItems();
    const item = items.find(item => item.producto_id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.cantidad = quantity;
        localStorage.setItem('cart_items', JSON.stringify(items));
      }
    }
  }

  removeFromCart(productId: string): void {
    const items = this.getCartItems();
    const filteredItems = items.filter(item => item.producto_id !== productId);
    localStorage.setItem('cart_items', JSON.stringify(filteredItems));
  }

  clearCart(): void {
    localStorage.removeItem('cart_items');
  }

  getCartItemCount(): number {
    const items = this.getCartItems();
    return items.reduce((total, item) => total + item.cantidad, 0);
  }
}

export const cartService = new CartService(); 