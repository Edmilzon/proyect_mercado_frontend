'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { VALIDATION } from '@/constants';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  MapPinIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Esquema de validación para editar perfil
const editProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  numero_telefono: z
    .string()
    .min(1, 'El número de teléfono es requerido')
    .regex(VALIDATION.PHONE_REGEX, 'El número de teléfono no es válido'),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      numero_telefono: user?.numero_telefono || '',
    },
  });

  const onSubmit = async (data: EditProfileData) => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      // await authService.updateProfile(data);
      
      // Simular actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push('/profile');
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/profile')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            </div>
            <p className="text-gray-600">
              Actualiza tu información personal
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  Perfil actualizado exitosamente
                </p>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Redirigiendo al perfil...
              </p>
            </div>
          )}

                  {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.nombre} {user.apellido}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Información Personal
              </h3>
            </div>
            
                      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre"
                placeholder="Juan"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              
              <Input
                label="Apellido"
                placeholder="Pérez"
                error={errors.apellido?.message}
                {...register('apellido')}
              />
            </div>

              <Input
                label="Email"
                type="email"
                value={user.email}
                disabled
                helperText="El email no se puede cambiar"
              />

              <Input
                label="Número de Teléfono"
                type="tel"
                placeholder="71234567"
                error={errors.numero_telefono?.message}
                {...register('numero_telefono')}
              />

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !isDirty}
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>

          {/* Additional Options */}
          <div className="mt-6 bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Otras Opciones
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Gestionar Direcciones
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <CogIcon className="w-4 h-4 mr-2" />
                Configuración de Notificaciones
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 