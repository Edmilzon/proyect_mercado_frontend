'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { formatCoordinate } from '@/utils/cn';
import { addressService } from '@/services/addresses';
import { 
  ArrowLeftIcon,
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

import { DireccionUsuario as Direccion } from '@/types';

export default function AddressesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Direccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    etiqueta: '',
    calle_avenida: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    pais: 'Bolivia',
    latitud: 0,
    longitud: 0,
    es_predeterminada: false
  });

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Cargar direcciones
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      if (!user?.usuario_id) {
        throw new Error('Usuario no identificado');
      }
      const addresses = await addressService.getAddresses(user.usuario_id);
      setAddresses(addresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth-store') ? JSON.parse(localStorage.getItem('auth-store')!).token : '';
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://proyect-mercado-backend.fly.dev/api';
      
      if (!user?.usuario_id) {
        throw new Error('Usuario no identificado');
      }

      if (editingId) {
        // Actualizar dirección existente
        const updatedAddress = await addressService.updateAddress(user.usuario_id, editingId, formData);
        setAddresses(prev => prev.map(addr => 
          addr.direccion_id === editingId 
            ? updatedAddress
            : addr
        ));
        setEditingId(null);
      } else {
        // Crear nueva dirección
        const newAddress = await addressService.createAddress(user.usuario_id, formData);
        setAddresses(prev => [...prev, newAddress]);
        setIsAdding(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error al guardar la dirección. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      try {
        if (!user?.usuario_id) {
          throw new Error('Usuario no identificado');
        }
        
        await addressService.deleteAddress(user.usuario_id, id);
        setAddresses(prev => prev.filter(addr => addr.direccion_id !== id));
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Error al eliminar la dirección. Inténtalo de nuevo.');
      }
    }
  };

  const handleEdit = (address: Direccion) => {
    setFormData({
      etiqueta: address.etiqueta || '',
      calle_avenida: address.calle_avenida || '',
      ciudad: address.ciudad || '',
      departamento: address.departamento || '',
      codigo_postal: address.codigo_postal || '',
      pais: address.pais || 'Bolivia',
      latitud: address.latitud || 0,
      longitud: address.longitud || 0,
      es_predeterminada: address.es_predeterminada || false
    });
    setEditingId(address.direccion_id);
  };

  const resetForm = () => {
    setFormData({
      etiqueta: '',
      calle_avenida: '',
      ciudad: '',
      departamento: '',
      codigo_postal: '',
      pais: 'Bolivia',
      latitud: 0,
      longitud: 0,
      es_predeterminada: false
    });
  };

  const getAddressIcon = (etiqueta: string | undefined) => {
    switch (etiqueta?.toLowerCase()) {
      case 'casa':
        return <HomeIcon className="w-5 h-5" />;
      case 'trabajo':
        return <BriefcaseIcon className="w-5 h-5" />;
      default:
        return <BuildingOfficeIcon className="w-5 h-5" />;
    }
  };

  if (!user) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/profile')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
            </div>
            <p className="text-gray-600">
              Gestiona tus direcciones de entrega
            </p>
          </div>

          {/* Add New Address Button */}
          {!isAdding && !editingId && (
            <div className="mb-6">
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Nueva Dirección
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Etiqueta"
                    placeholder="Casa, Trabajo, etc."
                    value={formData.etiqueta}
                    onChange={(e) => setFormData(prev => ({ ...prev, etiqueta: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Calle/Avenida"
                    placeholder="Av. Principal 123"
                    value={formData.calle_avenida}
                    onChange={(e) => setFormData(prev => ({ ...prev, calle_avenida: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ciudad"
                    placeholder="Cochabamba"
                    value={formData.ciudad}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Departamento"
                    placeholder="Cochabamba"
                    value={formData.departamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Código Postal"
                    placeholder="1234"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo_postal: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="País"
                    value={formData.pais}
                    onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                    required
                  />
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="es_predeterminada"
                      checked={formData.es_predeterminada}
                      onChange={(e) => setFormData(prev => ({ ...prev, es_predeterminada: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="es_predeterminada" className="text-sm text-gray-700">
                      Establecer como dirección predeterminada
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      resetForm();
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando direcciones...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tienes direcciones guardadas</p>
                <p className="text-gray-500 text-sm">Agrega tu primera dirección para comenzar</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.direccion_id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getAddressIcon(address.etiqueta)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {address.etiqueta}
                          </h3>
                          {address.es_predeterminada && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-1">{address.calle_avenida}</p>
                        <p className="text-gray-600 mb-1">
                          {address.ciudad}, {address.departamento} {address.codigo_postal}
                        </p>
                        <p className="text-gray-600">{address.pais}</p>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          Coordenadas: {formatCoordinate(address.latitud, 4)}, {formatCoordinate(address.longitud, 4)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.direccion_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
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