'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sellerService } from '@/services/seller';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon,
  ChatBubbleLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Order {
  pedido_id: string;
  comprador_id: string;
  fecha_pedido: string;
  monto_total: number;
  estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado' | 'reembolsado';
  notas_comprador?: string;
  notas_vendedor?: string;
  hora_estimada_entrega?: string;
  comprador?: {
    nombre: string;
    apellido: string;
    email: string;
  };
  items?: Array<{
    producto_id: string;
    cantidad: number;
    precio_en_compra: number;
    producto?: {
      nombre: string;
      url_imagen_principal?: string;
    };
  }>;
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('todos');

  useEffect(() => {
    if (user && user.rol === 'vendedor') {
      loadOrders();
    }
  }, [user, filter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {};
      if (filter !== 'todos') {
        filters.estado = filter;
      }

      const response = await sellerService.getSellerOrders(user!.usuario_id, filters);
      setOrders(response.pedidos || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (pedidoId: string, newStatus: string) => {
    try {
      await sellerService.updateOrderStatus(pedidoId, {
        estado: newStatus as any,
        notas_vendedor: `Estado actualizado a ${newStatus}`
      });
      await loadOrders(); // Recargar pedidos
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Error al actualizar el estado del pedido');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'en_preparacion':
        return 'bg-orange-100 text-orange-800';
      case 'en_ruta':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <ClockIcon className="w-4 h-4" />;
      case 'confirmado':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'en_preparacion':
        return <ClockIcon className="w-4 h-4" />;
      case 'en_ruta':
        return <TruckIcon className="w-4 h-4" />;
      case 'entregado':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelado':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los vendedores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'todos') return true;
    return order.estado === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todos los pedidos de tus productos
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pendiente')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'pendiente'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pendientes ({orders.filter(o => o.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setFilter('confirmado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'confirmado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Confirmados ({orders.filter(o => o.estado === 'confirmado').length})
            </button>
            <button
              onClick={() => setFilter('en_preparacion')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'en_preparacion'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              En Preparación ({orders.filter(o => o.estado === 'en_preparacion').length})
            </button>
            <button
              onClick={() => setFilter('en_ruta')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'en_ruta'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              En Ruta ({orders.filter(o => o.estado === 'en_ruta').length})
            </button>
            <button
              onClick={() => setFilter('entregado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'entregado'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Entregados ({orders.filter(o => o.estado === 'entregado').length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
              <p className="text-gray-600">
                {filter === 'todos' 
                  ? 'Aún no has recibido ningún pedido.'
                  : `No hay pedidos con estado "${filter}".`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.pedido_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{order.pedido_id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.fecha_pedido)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                      {getStatusIcon(order.estado)}
                      <span className="ml-1 capitalize">{order.estado.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                  <p className="text-sm text-gray-600">
                    {order.comprador?.nombre} {order.comprador?.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{order.comprador?.email}</p>
                </div>

                {/* Productos */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Productos</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {item.producto?.url_imagen_principal && (
                          <img
                            src={item.producto.url_imagen_principal}
                            alt={item.producto.nombre}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.producto?.nombre || 'Producto'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.cantidad} × Bs. {item.precio_en_compra}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      Bs. {order.monto_total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Notas */}
                {order.notas_comprador && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notas del Cliente</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {order.notas_comprador}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/seller/orders/${order.pedido_id}`, '_blank')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => window.open(`/seller/orders/${order.pedido_id}/chat`, '_blank')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                      Chat
                    </button>
                  </div>

                  {/* Botones de Estado */}
                  <div className="flex space-x-2">
                    {order.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.pedido_id, 'confirmado')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.pedido_id, 'cancelado')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {order.estado === 'confirmado' && (
                      <button
                        onClick={() => updateOrderStatus(order.pedido_id, 'en_preparacion')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                      >
                        En Preparación
                      </button>
                    )}
                    {order.estado === 'en_preparacion' && (
                      <button
                        onClick={() => updateOrderStatus(order.pedido_id, 'en_ruta')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                      >
                        En Ruta
                      </button>
                    )}
                    {order.estado === 'en_ruta' && (
                      <button
                        onClick={() => updateOrderStatus(order.pedido_id, 'entregado')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Entregado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 