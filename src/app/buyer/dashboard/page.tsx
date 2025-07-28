'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService, BuyerStatistics } from '@/services/buyer';
import Navbar from '@/components/layout/Navbar';
import { 
  ShoppingBagIcon,
  HeartIcon,
  BellIcon,
  StarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChatBubbleLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<BuyerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.rol === 'comprador') {
      loadBuyerData();
    }
  }, [user]);

  const loadBuyerData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stats = await buyerService.getBuyerStatistics(user!.usuario_id);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading buyer data:', error);
      setError('Error al cargar los datos del comprador');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
            <p className="text-gray-600 mt-2">
              Bienvenido, {user.nombre}. Aquí puedes gestionar tus compras y preferencias.
            </p>
          </div>

          {/* Estadísticas */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.total_pedidos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TruckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Entregados</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.pedidos_entregados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Gastado</p>
                    <p className="text-2xl font-semibold text-gray-900">Bs. {statistics.total_gastado.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HeartIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Favoritos</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.productos_favoritos}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="/products"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Explorar Productos</h3>
                  <p className="text-sm text-gray-500">Descubre nuevos productos</p>
                </div>
              </div>
            </a>

            <a
              href="/buyer/orders"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Mis Pedidos</h3>
                  <p className="text-sm text-gray-500">Ver estado de mis compras</p>
                </div>
              </div>
            </a>

            <a
              href="/buyer/favorites"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HeartIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Favoritos</h3>
                  <p className="text-sm text-gray-500">Productos que te gustan</p>
                </div>
              </div>
            </a>

            <a
              href="/buyer/reviews"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <StarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Mis Reseñas</h3>
                  <p className="text-sm text-gray-500">Reseñas que has escrito</p>
                </div>
              </div>
            </a>

            <a
              href="/buyer/notifications"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BellIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
                  <p className="text-sm text-gray-500">Mantente informado</p>
                </div>
              </div>
            </a>

            <a
              href="/chat"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Chat</h3>
                  <p className="text-sm text-gray-500">Habla con vendedores</p>
                </div>
              </div>
            </a>

            <a
              href="/profile"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
                  <p className="text-sm text-gray-500">Gestionar información personal</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 