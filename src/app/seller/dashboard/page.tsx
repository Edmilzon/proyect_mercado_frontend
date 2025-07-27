'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sellerService } from '@/services/seller';
import { Vendedor, SellerDashboard } from '@/types';

interface SellerDashboardPageProps {}

export default function SellerDashboardPage({}: SellerDashboardPageProps) {
  const { user } = useAuth();
  const [sellerData, setSellerData] = useState<Vendedor | null>(null);
  const [dashboardData, setDashboardData] = useState<SellerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    if (user && user.rol === 'vendedor') {
      loadSellerData();
    }
  }, [user]);

  const loadSellerData = async () => {
    try {
      if (!user?.usuario_id) {
        throw new Error('Usuario no identificado');
      }

      setIsLoading(true);
      setError(null);

      // Cargar datos del vendedor
      try {
        const sellerData = await sellerService.getSellerById(user.usuario_id);
        setSellerData(sellerData);
        setHasCompletedProfile(!!sellerData.numero_identificacion);
      } catch (error) {
        console.log('Vendedor no encontrado, creando datos por defecto...');
        setSellerData({
          vendedor_id: user?.usuario_id || '',
          numero_identificacion: '',
          estado_onboarding: 'pendiente',
          calificacion_promedio: 0,
          total_resenas: 0,
          tasa_comision: 0.05,
          creado_at: new Date().toISOString(),
          actualizado_at: new Date().toISOString(),
          usuario: undefined
        });
        setHasCompletedProfile(false);
      }

      // Cargar dashboard del vendedor usando la nueva API específica
      try {
        const dashboard = await sellerService.getSellerDashboard(user.usuario_id);
        setDashboardData(dashboard);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Si falla, crear datos por defecto
        setDashboardData({
          total_productos: 0,
          productos_activos: 0,
          productos_sin_stock: 0,
          total_pedidos: 0,
          pedidos_pendientes: 0,
          pedidos_confirmados: 0,
          pedidos_en_preparacion: 0,
          pedidos_en_ruta: 0,
          pedidos_entregados: 0,
          pedidos_cancelados: 0,
          calificacion_promedio: 0,
          total_resenas: 0,
          resenas_pendientes: 0,
          ventas_hoy: 0,
          ventas_semana: 0,
          ventas_mes: 0,
          mensajes_no_leidos: 0,
          conversaciones_activas: 0
        });
      }

    } catch (error) {
      console.error('Error loading seller data:', error);
      setError('Error al cargar los datos del vendedor');
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
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSellerData}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel del Vendedor</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user.nombre} {user.apellido}
          </p>
        </div>

        {/* Alertas */}
        {!hasCompletedProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Perfil incompleto
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Completa tu perfil de vendedor para acceder a todas las funcionalidades.
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href="/seller/onboarding"
                    className="bg-yellow-400 text-yellow-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-500"
                  >
                    Completar perfil
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Productos Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.productos_activos}</p>
                </div>
              </div>
            </div>

            {/* Pedidos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pedidos Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.pedidos_pendientes}</p>
                </div>
              </div>
            </div>

            {/* Ventas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
                  <p className="text-2xl font-semibold text-gray-900">Bs. {dashboardData.ventas_hoy.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Calificación */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Calificación</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.calificacion_promedio.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/seller/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Gestionar Productos</h3>
                <p className="text-sm text-gray-500">Agregar, editar o eliminar productos</p>
              </div>
            </div>
          </a>

          <a
            href="/seller/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Gestionar Pedidos</h3>
                <p className="text-sm text-gray-500">Ver y gestionar pedidos de clientes</p>
              </div>
            </div>
          </a>

          <a
            href="/seller/reviews"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reseñas</h3>
                <p className="text-sm text-gray-500">Ver y responder reseñas de clientes</p>
              </div>
            </div>
          </a>

          <a
            href="/seller/location"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Ubicación</h3>
                <p className="text-sm text-gray-500">Actualizar ubicación en tiempo real</p>
              </div>
            </div>
          </a>

          <a
            href="/chat"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Chat</h3>
                <p className="text-sm text-gray-500">Comunicarte con tus clientes</p>
              </div>
            </div>
          </a>

          <a
            href="/seller/onboarding"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Completar Perfil</h3>
                <p className="text-sm text-gray-500">Finalizar configuración de vendedor</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
} 