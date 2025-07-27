'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { sellerService } from '@/services/seller';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon,
  IdentificationIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Formulario de registro
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    numero_telefono: '',
    rol: 'comprador' as 'comprador' | 'vendedor'
  });

  // Formulario de datos extra de vendedor
  const [sellerData, setSellerData] = useState({
    numero_identificacion: '',
    latitud_actual: -16.4897,
    longitud_actual: -68.1193,
    zona_asignada_id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSellerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSellerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        numero_telefono: formData.numero_telefono,
        rol: formData.rol
      });

      setRegisteredUser(response.usuario);
      
      if (formData.rol === 'vendedor') {
        setShowSellerForm(true);
      } else {
        // Login automático para compradores
        await login(formData.email, formData.password);
        onSuccess?.();
        router.push('/');
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sellerService.registerSeller({
        vendedor_id: registeredUser.usuario_id,
        numero_identificacion: sellerData.numero_identificacion,
        estado_onboarding: 'pendiente',
        latitud_actual: sellerData.latitud_actual,
        longitud_actual: sellerData.longitud_actual,
        zona_asignada_id: sellerData.zona_asignada_id || undefined
      });

      // Login automático
      await login(formData.email, formData.password);
      onSuccess?.();
      router.push('/seller/dashboard');
    } catch (error: any) {
      setError(error.message || 'Error al registrar datos de vendedor');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSellerData(prev => ({
            ...prev,
            latitud_actual: position.coords.latitude,
            longitud_actual: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('No se pudo obtener la ubicación automáticamente');
        }
      );
    }
  };

  if (showSellerForm) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mt-2">
            Completa los datos adicionales para activar tu cuenta de vendedor
          </p>
        </div>

        <form onSubmit={handleSellerSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Identificación
            </label>
            <Input
              type="text"
              name="numero_identificacion"
              value={sellerData.numero_identificacion}
              onChange={handleSellerInputChange}
              placeholder="12345678"
              required
              icon={<IdentificationIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Actual
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                name="latitud_actual"
                value={sellerData.latitud_actual}
                onChange={handleSellerInputChange}
                placeholder="Latitud"
                step="any"
                required
              />
              <Input
                type="number"
                name="longitud_actual"
                value={sellerData.longitud_actual}
                onChange={handleSellerInputChange}
                placeholder="Longitud"
                step="any"
                required
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <MapPinIcon className="w-4 h-4 mr-1" />
              Obtener ubicación automáticamente
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona de Entrega (Opcional)
            </label>
            <Input
              type="text"
              name="zona_asignada_id"
              value={sellerData.zona_asignada_id}
              onChange={handleSellerInputChange}
              placeholder="ID de zona (se asignará automáticamente)"
            />
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Completando registro...' : 'Completar Registro de Vendedor'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-600 mt-2">
          Únete a nuestra plataforma de comercio electrónico
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <Input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              required
              icon={<UserIcon className="w-5 h-5" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <Input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              placeholder="Tu apellido"
              required
              icon={<UserIcon className="w-5 h-5" />}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            required
            icon={<EnvelopeIcon className="w-5 h-5" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            type="tel"
            name="numero_telefono"
            value={formData.numero_telefono}
            onChange={handleInputChange}
            placeholder="71234567"
            required
            icon={<PhoneIcon className="w-5 h-5" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mínimo 6 caracteres"
            required
            icon={<LockClosedIcon className="w-5 h-5" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Contraseña
          </label>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repite tu contraseña"
            required
            icon={<LockClosedIcon className="w-5 h-5" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Cuenta
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </form>
    </div>
  );
}; 