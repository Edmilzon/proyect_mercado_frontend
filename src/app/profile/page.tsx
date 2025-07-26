'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';

import { 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'vendedor':
        return 'bg-green-100 text-green-800';
      case 'comprador':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                              <div className="text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.nombre} {user.apellido}
                  </h2>
                  
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor(user.rol)}`}>
                    <ShieldCheckIcon className="w-4 h-4 mr-1" />
                    {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                  </span>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center justify-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {user.numero_telefono}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full"
                    variant={isEditing ? "outline" : "default"}
                  >
                    {isEditing ? (
                      <>
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Información Personal
                  </h3>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <UserCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.nombre}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <UserCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.apellido}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.numero_telefono}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Información de la Cuenta
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado de la Cuenta
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-md">
                          <div className={`w-2 h-2 rounded-full mr-3 ${user.esta_activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-900">
                            {user.esta_activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Última Sesión
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-md">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {user.ultima_sesion_at 
                              ? formatDate(user.ultima_sesion_at)
                              : 'Nunca'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Registro
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-md">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {formatDate(user.creado_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Última Actualización
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-md">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {formatDate(user.actualizado_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Acciones Rápidas
                    </h4>
                    
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/profile/addresses')}
                    >
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      Gestionar Direcciones
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <ShieldCheckIcon className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 