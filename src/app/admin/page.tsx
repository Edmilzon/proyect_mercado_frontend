'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { sellerService } from '@/services/seller';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { 
  UsersIcon, 
  UserIcon,
  UserPlusIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SellerStats {
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    total: 0,
    aprobados: 0,
    pendientes: 0,
    rechazados: 0
  });
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'pendientes' | 'aprobados' | 'rechazados'>('todos');

  // Redirigir si no es admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.rol !== 'admin' && user?.rol !== 'super_admin') {
      router.push('/');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const sellersData = await sellerService.getAllSellers();
      
      // Calcular estadísticas localmente
      const statsData = {
        total: sellersData.length,
        aprobados: sellersData.filter(s => s.estado_onboarding === 'aprobado').length,
        pendientes: sellersData.filter(s => s.estado_onboarding === 'pendiente').length,
        rechazados: sellersData.filter(s => s.estado_onboarding === 'rechazado').length,
      };
      
      setSellers(sellersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (sellerId: string, newStatus: 'aprobado' | 'rechazado') => {
    try {
      // Por ahora, solo recargar datos ya que no hay endpoint específico para actualizar estado
      // TODO: Implementar cuando el backend tenga el endpoint de validación de vendedores
      console.log(`Actualizando estado del vendedor ${sellerId} a ${newStatus}`);
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('Error updating seller status:', error);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pendiente':
        return <ClockIcon className="w-4 h-4" />;
      case 'rechazado':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (filter === 'todos') return true;
    return seller.estado_onboarding === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando panel de administración...</p>
            </div>
          </div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600 mt-2">
                  Gestiona usuarios y valida vendedores
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-gray-500">
                  {user?.rol === 'super_admin' ? 'Super Administrador' : 'Administrador'}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Vendedores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aprobados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aprobados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rechazados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rechazados}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Vendedores</h2>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('todos')}
                >
                  Todos ({stats.total})
                </Button>
                <Button
                  variant={filter === 'pendientes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pendientes')}
                >
                  Pendientes ({stats.pendientes})
                </Button>
                <Button
                  variant={filter === 'aprobados' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('aprobados')}
                >
                  Aprobados ({stats.aprobados})
                </Button>
                <Button
                  variant={filter === 'rechazados' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('rechazados')}
                >
                  Rechazados ({stats.rechazados})
                </Button>
              </div>
            </div>

            {/* Lista de vendedores */}
            <div className="space-y-4">
              {filteredSellers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay vendedores que mostrar</p>
                </div>
              ) : (
                filteredSellers.map((seller) => (
                  <div key={seller.vendedor_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {seller.usuario?.nombre} {seller.usuario?.apellido}
                          </h3>
                          <p className="text-sm text-gray-500">{seller.usuario?.email}</p>
                          <p className="text-sm text-gray-500">CI: {seller.numero_identificacion}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(seller.estado_onboarding)}`}>
                          {getStatusIcon(seller.estado_onboarding)}
                          <span className="ml-1 capitalize">{seller.estado_onboarding}</span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowSellerModal(true);
                            }}
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Ver
                          </Button>

                          {seller.estado_onboarding === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(seller.vendedor_id, 'aprobado')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(seller.vendedor_id, 'rechazado')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
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

      {/* Modal de detalles del vendedor */}
      {showSellerModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles del Vendedor
                </h3>
                <button
                  onClick={() => setShowSellerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información Personal</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{selectedSeller.usuario?.nombre} {selectedSeller.usuario?.apellido}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedSeller.usuario?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{selectedSeller.usuario?.numero_telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CI</p>
                      <p className="font-medium">{selectedSeller.numero_identificacion}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información de Vendedor</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSeller.estado_onboarding)}`}>
                        {getStatusIcon(selectedSeller.estado_onboarding)}
                        <span className="ml-1 capitalize">{selectedSeller.estado_onboarding}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Calificación</p>
                      <p className="font-medium">{selectedSeller.calificacion_promedio || 0}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reseñas</p>
                      <p className="font-medium">{selectedSeller.total_resenas || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comisión</p>
                      <p className="font-medium">{(selectedSeller.tasa_comision * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ubicación</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Latitud</p>
                      <p className="font-medium">{selectedSeller.latitud_actual || 'No registrada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Longitud</p>
                      <p className="font-medium">{selectedSeller.longitud_actual || 'No registrada'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fechas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registrado</p>
                      <p className="font-medium">{new Date(selectedSeller.creado_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última actualización</p>
                      <p className="font-medium">{new Date(selectedSeller.actualizado_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 