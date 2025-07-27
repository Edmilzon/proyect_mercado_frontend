'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { zonesService } from '@/services/zones';
import { DeliveryMap } from '@/components/logistics/DeliveryMap';
import { ZonesManager } from '@/components/logistics/ZonesManager';
import { OrderTracking } from '@/components/logistics/OrderTracking';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { ZonaEntrega, TarifaCalculada } from '@/types';
import {
  MapIcon,
  TruckIcon,
  CogIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function LogisticsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'map' | 'zones' | 'tracking' | 'stats'>('map');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [tarifaCalculada, setTarifaCalculada] = useState<number | null>(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaEntrega | null>(null);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);
      const stats = await zonesService.getEstadisticasZonas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      cargarEstadisticas();
    }
  }, [activeTab]);

  const handleTarifaCalculada = (tarifa: number) => {
    setTarifaCalculada(tarifa);
  };

  const handleZonaSeleccionada = (zona: ZonaEntrega) => {
    setZonaSeleccionada(zona);
  };

  const handleZoneCreated = (zona: ZonaEntrega) => {
    // Recargar estadísticas si estamos en esa pestaña
    if (activeTab === 'stats') {
      cargarEstadisticas();
    }
  };

  const handleZoneUpdated = (zona: ZonaEntrega) => {
    // Recargar estadísticas si estamos en esa pestaña
    if (activeTab === 'stats') {
      cargarEstadisticas();
    }
  };

  const handleZoneDeleted = (zonaId: string) => {
    // Recargar estadísticas si estamos en esa pestaña
    if (activeTab === 'stats') {
      cargarEstadisticas();
    }
  };

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Logística y Entrega</h1>
            <p className="text-gray-600 mt-2">
              Gestiona zonas de entrega, tracking de pedidos y optimización de rutas
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'map'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapIcon className="w-5 h-5" />
                <span>Mapa de Entregas</span>
              </button>

              <button
                onClick={() => setActiveTab('zones')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'zones'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CogIcon className="w-5 h-5" />
                <span>Gestión de Zonas</span>
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'tracking'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TruckIcon className="w-5 h-5" />
                <span>Tracking de Pedidos</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Estadísticas</span>
              </button>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {/* Mapa de Entregas */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Mapa de Entregas en Tiempo Real</h2>
                    <div className="flex items-center space-x-2">
                      {tarifaCalculada && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-green-800">
                            Tarifa: Bs. {tarifaCalculada.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {zonaSeleccionada && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-blue-800">
                            Zona: {zonaSeleccionada.nombre}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DeliveryMap
                    pedidoId="test-pedido"
                    onTarifaCalculada={handleTarifaCalculada}
                    onZonaSeleccionada={handleZonaSeleccionada}
                    modoVendedor={user?.rol === 'vendedor'}
                    className="h-96"
                  />
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Zonas Activas</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {estadisticas?.zonasActivas || 0}
                    </p>
                    <p className="text-sm text-gray-500">Zonas disponibles para entrega</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendedores Asignados</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {estadisticas?.vendedoresAsignados || 0}
                    </p>
                    <p className="text-sm text-gray-500">Vendedores en zonas activas</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Entregas Hoy</h3>
                    <p className="text-3xl font-bold text-purple-600">12</p>
                    <p className="text-sm text-gray-500">Pedidos en proceso de entrega</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gestión de Zonas */}
            {activeTab === 'zones' && (
              <ZonesManager
                onZoneCreated={handleZoneCreated}
                onZoneUpdated={handleZoneUpdated}
                onZoneDeleted={handleZoneDeleted}
              />
            )}

            {/* Tracking de Pedidos */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Tracking de Pedidos</h2>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Ingresa ID del pedido..."
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Button
                        onClick={() => setSelectedOrderId('test-pedido-123')}
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                        Buscar
                      </Button>
                    </div>
                  </div>

                  {selectedOrderId ? (
                    <OrderTracking
                      pedidoId={selectedOrderId}
                      className="min-h-96"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Buscar Pedido para Tracking
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Ingresa el ID del pedido para ver su estado y ubicación en tiempo real
                      </p>
                      <Button
                        onClick={() => setSelectedOrderId('test-pedido-123')}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Ver Pedido de Ejemplo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Zonas</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {estadisticas?.totalZonas || 0}
                    </p>
                    <p className="text-sm text-gray-500">Zonas configuradas</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Zonas Activas</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {estadisticas?.zonasActivas || 0}
                    </p>
                    <p className="text-sm text-gray-500">Disponibles para entrega</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Zonas Inactivas</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {estadisticas?.zonasInactivas || 0}
                    </p>
                    <p className="text-sm text-gray-500">Temporalmente deshabilitadas</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendedores Asignados</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {estadisticas?.vendedoresAsignados || 0}
                    </p>
                    <p className="text-sm text-gray-500">En zonas activas</p>
                  </div>
                </div>

                {/* Gráficos y métricas adicionales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Entregas por Zona</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Zona Centro</span>
                        <span className="text-sm font-medium">45 entregas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Zona Sur</span>
                        <span className="text-sm font-medium">32 entregas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Zona Norte</span>
                        <span className="text-sm font-medium">28 entregas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Vendedores</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tiempo promedio de entrega</span>
                        <span className="text-sm font-medium">25 min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Entregas exitosas</span>
                        <span className="text-sm font-medium">98.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Satisfacción del cliente</span>
                        <span className="text-sm font-medium">4.8/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 