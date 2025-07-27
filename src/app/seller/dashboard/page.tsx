'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { sellerService } from '@/services/seller';
import { formatCoordinate } from '@/utils/cn';
import { 
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import { Vendedor } from '@/types';

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sellerData, setSellerData] = useState<Vendedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVentas: 0,
    ventasHoy: 0,
    productosActivos: 0,
    calificacionPromedio: 0
  });

  // Verificar si el vendedor ha completado su perfil
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkSellerProfile = async () => {
      try {
        const sellerData = await sellerService.getSellerById(user!.usuario_id);
        setHasCompletedProfile(!!sellerData.numero_identificacion);
      } catch (error) {
        // Si no existe el vendedor, no ha completado el perfil
        setHasCompletedProfile(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (user) {
      checkSellerProfile();
    }
  }, [user]);

  // Redirigir si no está autenticado o no es vendedor
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.rol !== 'vendedor') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Cargar datos del vendedor
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
      
      // Cargar datos del vendedor
      const sellerData = await sellerService.getSellerData(user.usuario_id);
      setSellerData(sellerData);
      
      // Cargar estadísticas
      const statsData = await sellerService.getSellerStats(user.usuario_id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading seller data:', error);
      // Si hay error, mostrar mensaje pero no bloquear la página
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
    } finally {
      setIsLoading(false);
    }
  };

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnboardingStatusText = (status: string) => {
    switch (status) {
      case 'aprobado':
        return 'Aprobado';
      case 'pendiente':
        return 'En Revisión';
      case 'rechazado':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  };

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los vendedores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Panel de Vendedor</h1>
            <p className="text-gray-600 mt-2">
              Bienvenido, {user.nombre} {user.apellido}
            </p>
          </div>

          {/* Onboarding Status */}
          {sellerData && sellerData.estado_onboarding !== 'aprobado' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Estado: {getOnboardingStatusText(sellerData.estado_onboarding)}
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Tu cuenta está siendo revisada. Podrás vender productos una vez que sea aprobada.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVentas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ventasHoy}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.productosActivos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <StarIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Calificación</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.calificacionPromedio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seller Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">
                      {user.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.nombre} {user.apellido}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                {sellerData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOnboardingStatusColor(sellerData.estado_onboarding)}`}>
                        {getOnboardingStatusText(sellerData.estado_onboarding)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CI/NIT:</span>
                      <span className="text-sm font-medium text-gray-900">{sellerData.numero_identificacion}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Comisión:</span>
                      <span className="text-sm font-medium text-gray-900">{(sellerData.tasa_comision * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reseñas:</span>
                      <span className="text-sm font-medium text-gray-900">{sellerData.total_resenas}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Calificación:</span>
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{sellerData.calificacion_promedio}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => router.push('/profile')}
                    variant="outline"
                    className="w-full"
                  >
                    <UserCircleIcon className="w-4 h-4 mr-2" />
                    Ver Perfil Completo
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Acciones Rápidas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push('/seller/products')}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Gestionar Productos
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/seller/orders')}
                    variant="outline"
                    className="w-full"
                  >
                    <ShoppingBagIcon className="w-4 h-4 mr-2" />
                    Ver Pedidos
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/seller/analytics')}
                    variant="outline"
                    className="w-full"
                  >
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Análisis de Ventas
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/seller/settings')}
                    variant="outline"
                    className="w-full"
                  >
                    <CogIcon className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </div>
              </div>

              {/* Location Info */}
              {sellerData && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación Actual</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Coordenadas:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCoordinate(sellerData.latitud_actual, 4)}, {formatCoordinate(sellerData.longitud_actual, 4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Última actualización:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {sellerData.ultima_actualizacion_ubicacion ? new Date(sellerData.ultima_actualizacion_ubicacion).toLocaleString('es-ES') : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Zona asignada:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {sellerData.zona_asignada_id || 'No asignada'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => router.push('/seller/location')}
                      variant="outline"
                      className="w-full"
                    >
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      Actualizar Ubicación
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 