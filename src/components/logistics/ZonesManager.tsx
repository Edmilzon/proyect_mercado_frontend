'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { zonesService } from '@/services/zones';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ZonaEntrega, 
  CreateZonaEntregaRequest, 
  UpdateZonaEntregaRequest,
  Vendedor 
} from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ZonesManagerProps {
  onZoneCreated?: (zona: ZonaEntrega) => void;
  onZoneUpdated?: (zona: ZonaEntrega) => void;
  onZoneDeleted?: (zonaId: string) => void;
  className?: string;
}

export const ZonesManager: React.FC<ZonesManagerProps> = ({
  onZoneCreated,
  onZoneUpdated,
  onZoneDeleted,
  className = ''
}) => {
  const { user } = useAuth();
  const [zonas, setZonas] = useState<ZonaEntrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para formularios
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ZonaEntrega | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZonaEntrega | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateZonaEntregaRequest>({
    nombre: '',
    descripcion: '',
    coordenadas_poligono: '',
    tarifa_envio: 0,
    esta_activa: true
  });
  
  // Estados para vendedores
  const [vendedoresZona, setVendedoresZona] = useState<Vendedor[]>([]);
  const [showVendedores, setShowVendedores] = useState(false);

  // Cargar zonas
  const cargarZonas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const zonasData = await zonesService.getZonas();
      setZonas(zonasData);
    } catch (error) {
      console.error('Error loading zones:', error);
      setError('Error al cargar las zonas de entrega');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar vendedores de una zona
  const cargarVendedoresZona = async (zonaId: string) => {
    try {
      const vendedores = await zonesService.getVendedoresByZona(zonaId);
      setVendedoresZona(vendedores);
    } catch (error) {
      console.error('Error loading zone sellers:', error);
    }
  };

  // Crear zona
  const crearZona = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const nuevaZona = await zonesService.createZona(formData);
      setZonas(prev => [...prev, nuevaZona]);
      setShowCreateForm(false);
      resetForm();
      onZoneCreated?.(nuevaZona);
    } catch (error) {
      console.error('Error creating zone:', error);
      setError('Error al crear la zona');
    }
  };

  // Actualizar zona
  const actualizarZona = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingZone) return;
    
    try {
      const zonaActualizada = await zonesService.updateZona(editingZone.zona_id, formData);
      setZonas(prev => prev.map(z => z.zona_id === editingZone.zona_id ? zonaActualizada : z));
      setEditingZone(null);
      resetForm();
      onZoneUpdated?.(zonaActualizada);
    } catch (error) {
      console.error('Error updating zone:', error);
      setError('Error al actualizar la zona');
    }
  };

  // Eliminar zona
  const eliminarZona = async (zonaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona?')) return;
    
    try {
      await zonesService.deleteZona(zonaId);
      setZonas(prev => prev.filter(z => z.zona_id !== zonaId));
      onZoneDeleted?.(zonaId);
    } catch (error) {
      console.error('Error deleting zone:', error);
      setError('Error al eliminar la zona');
    }
  };

  // Editar zona
  const editarZona = (zona: ZonaEntrega) => {
    setEditingZone(zona);
    setFormData({
      nombre: zona.nombre,
      descripcion: zona.descripcion || '',
      coordenadas_poligono: zona.coordenadas_poligono,
      tarifa_envio: zona.tarifa_envio,
      esta_activa: zona.esta_activa
    });
  };

  // Ver vendedores de zona
  const verVendedores = async (zona: ZonaEntrega) => {
    setSelectedZone(zona);
    await cargarVendedoresZona(zona.zona_id);
    setShowVendedores(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      coordenadas_poligono: '',
      tarifa_envio: 0,
      esta_activa: true
    });
  };

  // Generar polígono de ejemplo
  const generarPoligonoEjemplo = () => {
    const poligonoEjemplo = {
      type: 'Polygon',
      coordinates: [[
        [-68.1193, -16.4897],
        [-68.1093, -16.4897],
        [-68.1093, -16.4797],
        [-68.1193, -16.4797],
        [-68.1193, -16.4897]
      ]]
    };
    
    setFormData(prev => ({
      ...prev,
      coordenadas_poligono: JSON.stringify(poligonoEjemplo)
    }));
  };

  // Efectos
  useEffect(() => {
    cargarZonas();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando zonas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Zonas de Entrega</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulario de creación/edición */}
      {(showCreateForm || editingZone) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingZone ? 'Editar Zona' : 'Nueva Zona de Entrega'}
          </h3>
          
          <form onSubmit={editingZone ? actualizarZona : crearZona} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Zona
                </label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Zona Centro"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa de Envío (Bs.)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tarifa_envio}
                  onChange={(e) => setFormData(prev => ({ ...prev, tarifa_envio: parseFloat(e.target.value) }))}
                  placeholder="15.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la zona..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordenadas del Polígono (GeoJSON)
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.coordenadas_poligono}
                  onChange={(e) => setFormData(prev => ({ ...prev, coordenadas_poligono: e.target.value }))}
                  placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  rows={6}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generarPoligonoEjemplo}
                  size="sm"
                >
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  Generar Ejemplo
                </Button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="esta_activa"
                checked={formData.esta_activa}
                onChange={(e) => setFormData(prev => ({ ...prev, esta_activa: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="esta_activa" className="ml-2 text-sm text-gray-700">
                Zona activa
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingZone ? 'Actualizar Zona' : 'Crear Zona'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingZone(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de zonas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Zonas de Entrega ({zonas.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {zonas.length === 0 ? (
            <div className="p-6 text-center">
              <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay zonas de entrega configuradas</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Crear Primera Zona
              </Button>
            </div>
          ) : (
            zonas.map((zona) => (
              <div key={zona.zona_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{zona.nombre}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        zona.esta_activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {zona.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    
                    {zona.descripcion && (
                      <p className="text-gray-600 mt-1">{zona.descripcion}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 mt-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        Bs. {zona.tarifa_envio}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {zona.vendedores?.length || 0} vendedores
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {new Date(zona.creado_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => verVendedores(zona)}
                      size="sm"
                      variant="outline"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Vendedores
                    </Button>
                    
                    <Button
                      onClick={() => editarZona(zona)}
                      size="sm"
                      variant="outline"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      onClick={() => eliminarZona(zona.zona_id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de vendedores */}
      {showVendedores && selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vendedores en {selectedZone.nombre}
                </h3>
                <button
                  onClick={() => setShowVendedores(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {vendedoresZona.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay vendedores asignados a esta zona</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendedoresZona.map((vendedor) => (
                    <div key={vendedor.vendedor_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {vendedor.nombre} {vendedor.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{vendedor.email}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {vendedor.estado_onboarding}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 