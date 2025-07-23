import { getApiUrl, API_CONFIG } from '@/config/api';

export interface PedidoDetalle {
  productoId: number;
  cantidad: number;
  precio: number;
}

export interface PedidoPayload {
  usuarioId: number;
  direccion: string;
  detalles: PedidoDetalle[];
}

export async function registrarPedido(payload: PedidoPayload) {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.VENTAS);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al registrar el pedido');
  }
  return res.json();
}

export async function getPedidos() {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.VENTAS);
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al obtener los pedidos');
  }
  return res.json();
}

export async function actualizarEstadoPedido(id: number, estado: string) {
  const url = getApiUrl(`${API_CONFIG.ENDPOINTS.VENTAS}/${id}/estado`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al actualizar el estado del pedido');
  }
  return res.json();
} 