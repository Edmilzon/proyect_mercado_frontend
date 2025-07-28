import { ApiService } from './api';

// Interfaces para pedidos
export interface OrderItem {
  producto_id: string;
  cantidad: number;
}

export interface CreateOrderRequest {
  comprador_id: string;
  vendedor_id: string;
  direccion_entrega_id: string;
  costo_envio: number;
  monto_descuento: number;
  notas_comprador?: string;
  whatsapp_pedido_id?: string;
  items: OrderItem[];
}

export interface Order {
  pedido_id: string;
  comprador_id: string;
  vendedor_id: string;
  direccion_entrega_id: string;
  costo_envio: number;
  monto_descuento: number;
  monto_total: number;
  estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado' | 'reembolsado';
  notas_comprador?: string;
  notas_vendedor?: string;
  hora_estimada_entrega?: string;
  whatsapp_pedido_id?: string;
  creado_at: string;
  actualizado_at: string;
  items: OrderItem[];
  comprador?: {
    usuario_id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  vendedor?: {
    vendedor_id: string;
    numero_identificacion: string;
    estado_onboarding: string;
  };
  direccion_entrega?: {
    direccion_id: string;
    etiqueta: string;
    calle_avenida: string;
    ciudad: string;
    departamento: string;
  };
}

export interface UpdateOrderStatusRequest {
  estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado' | 'reembolsado';
  notas_vendedor?: string;
  hora_estimada_entrega?: string;
}

class OrdersService extends ApiService {
  // Crear nuevo pedido
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return this.post<Order>('/pedidos', orderData);
  }

  // Obtener pedido específico
  async getOrder(orderId: string): Promise<Order> {
    return this.get<Order>(`/pedidos/${orderId}`);
  }

  // Listar mis pedidos (comprador)
  async getMyOrders(): Promise<Order[]> {
    return this.get<Order[]>('/pedidos/mis-pedidos');
  }

  // Listar pedidos de un vendedor
  async getVendorOrders(vendorId: string): Promise<Order[]> {
    return this.get<Order[]>(`/pedidos/vendedor/${vendorId}`);
  }

  // Actualizar estado del pedido
  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order> {
    return this.put<Order>(`/pedidos/${orderId}/estado`, statusData);
  }

  // Eliminar pedido (solo pendientes)
  async deleteOrder(orderId: string): Promise<void> {
    return this.delete(`/pedidos/${orderId}`);
  }

  // Listar todos los pedidos (admin)
  async getAllOrders(): Promise<Order[]> {
    return this.get<Order[]>('/pedidos');
  }
}

export const ordersService = new OrdersService(); 