'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { 
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Order {
  pedido_id: string;
  fecha_creacion: string;
  estado: string;
  total: number;
  productos: Array<{
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    url_imagen_principal?: string;
  }>;
  vendedor?: {
    nombre: string;
    apellido: string;
  };
  direccion_entrega?: string;
  notas_comprador?: string;
}

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (user && user.rol === 'comprador') {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await buyerService.getMyOrders();
      setOrders(response || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'en_proceso':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'entregado':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelado':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ShoppingBagIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOrderStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        const estado = order.estado.toLowerCase();
        switch (filter) {
          case 'pending':
            return estado === 'pendiente';
          case 'delivered':
            return estado === 'entregado';
          case 'cancelled':
            return estado === 'cancelado';
          default:
            return true;
        }
      });

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
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'comprador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Acceso Denegado</div>
          <p className="text-gray-600">Solo los compradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
            <p className="text-gray-600 mt-2">
              Historial de todas tus compras
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' ? 'bg-blue-600 text-white' : ''}
              >
                Todos ({orders.length})
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                variant={filter === 'pending' ? 'default' : 'outline'}
                className={filter === 'pending' ? 'bg-blue-600 text-white' : ''}
              >
                Pendientes ({orders.filter(o => o.estado.toLowerCase() === 'pendiente').length})
              </Button>
              <Button
                onClick={() => setFilter('delivered')}
                variant={filter === 'delivered' ? 'default' : 'outline'}
                className={filter === 'delivered' ? 'bg-blue-600 text-white' : ''}
              >
                Entregados ({orders.filter(o => o.estado.toLowerCase() === 'entregado').length})
              </Button>
              <Button
                onClick={() => setFilter('cancelled')}
                variant={filter === 'cancelled' ? 'default' : 'outline'}
                className={filter === 'cancelled' ? 'bg-blue-600 text-white' : ''}
              >
                Cancelados ({orders.filter(o => o.estado.toLowerCase() === 'cancelado').length})
              </Button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos</h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' ? 'Aún no has realizado ningún pedido.' :
                   filter === 'pending' ? 'No tienes pedidos pendientes.' :
                   filter === 'delivered' ? 'No tienes pedidos entregados.' :
                   'No tienes pedidos cancelados.'}
                </p>
                {filter === 'all' && (
                  <Button
                    onClick={() => window.location.href = '/products'}
                    className="bg-blue-600 text-white"
                  >
                    Explorar Productos
                  </Button>
                )}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.pedido_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header del pedido */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getOrderStatusIcon(order.estado)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.pedido_id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.fecha_creacion)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.estado)}`}>
                          {getOrderStatusText(order.estado)}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.location.href = `/buyer/orders/${order.pedido_id}`}
                            variant="outline"
                            size="sm"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                          
                          {order.estado.toLowerCase() === 'entregado' && (
                            <Button
                              onClick={() => window.location.href = `/buyer/reviews/create?pedido_id=${order.pedido_id}`}
                              variant="outline"
                              size="sm"
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            >
                              <StarIcon className="h-4 w-4 mr-2" />
                              Reseñar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Productos del pedido */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.productos.map((producto, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {producto.url_imagen_principal ? (
                              <img
                                src={producto.url_imagen_principal}
                                alt={producto.nombre}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Sin imagen</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {producto.nombre}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Cantidad: {producto.cantidad} × Bs. {producto.precio_unitario.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-900">
                            Bs. {(producto.cantidad * producto.precio_unitario).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.vendedor && (
                          <div>
                            <p className="text-sm text-gray-500">Vendedor</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.vendedor.nombre} {order.vendedor.apellido}
                            </p>
                          </div>
                        )}
                        
                        {order.direccion_entrega && (
                          <div>
                            <p className="text-sm text-gray-500">Dirección de entrega</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.direccion_entrega}
                            </p>
                          </div>
                        )}
                      </div>

                      {order.notas_comprador && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Notas</p>
                          <p className="text-sm text-gray-900">{order.notas_comprador}</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total del pedido</span>
                        <span className="text-lg font-bold text-gray-900">
                          Bs. {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 