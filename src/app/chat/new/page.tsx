'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { Conversacion, Usuario } from '@/types';
import { 
  ArrowLeftIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function NewConversationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Cargar usuarios (simulado por ahora)
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por ahora, simulamos usuarios
      // En una implementación real, esto vendría de una API
      const mockUsers: Usuario[] = [
        {
          usuario_id: 'user-1',
          email: 'vendedor1@gmail.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          numero_telefono: '71234567',
          rol: 'vendedor',
          esta_activo: true,
          creado_at: new Date().toISOString(),
          actualizado_at: new Date().toISOString()
        },
        {
          usuario_id: 'user-2',
          email: 'vendedor2@gmail.com',
          nombre: 'María',
          apellido: 'García',
          numero_telefono: '71234568',
          rol: 'vendedor',
          esta_activo: true,
          creado_at: new Date().toISOString(),
          actualizado_at: new Date().toISOString()
        },
        {
          usuario_id: 'user-3',
          email: 'comprador1@gmail.com',
          nombre: 'Carlos',
          apellido: 'López',
          numero_telefono: '71234569',
          rol: 'comprador',
          esta_activo: true,
          creado_at: new Date().toISOString(),
          actualizado_at: new Date().toISOString()
        }
      ];
      
      // Filtrar el usuario actual
      const otherUsers = mockUsers.filter(u => u.usuario_id !== user?.usuario_id);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (otherUser: Usuario) => {
    if (!user) return;

    try {
      setIsCreating(true);
      setError(null);

      // Crear nueva conversación
      const newConversation = await chatService.createConversacion({
        tipo_conversacion: 'directa',
        participantes: [user.usuario_id, otherUser.usuario_id]
      });

      // Redirigir al chat
      router.push(`/chat?conversation=${newConversation.conversacion_id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Error al crear la conversación');
    } finally {
      setIsCreating(false);
    }
  };

  const startOrderConversation = async (orderId: string) => {
    if (!user) return;

    try {
      setIsCreating(true);
      setError(null);

      // Crear conversación vinculada a un pedido
      const newConversation = await chatService.createConversacion({
        pedido_id: orderId,
        tipo_conversacion: 'directa',
        participantes: [user.usuario_id] // Se agregarán más participantes según el pedido
      });

      // Redirigir al chat
      router.push(`/chat?conversation=${newConversation.conversacion_id}`);
    } catch (error) {
      console.error('Error creating order conversation:', error);
      setError('Error al crear la conversación del pedido');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
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
                onClick={() => router.push('/chat')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Conversación</h1>
            </div>
            <p className="text-gray-600">
              Inicia una conversación con otro usuario o crea un chat vinculado a un pedido
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conversación con Usuario */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2" />
                Conversación Directa
              </h2>

              {/* Buscador */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              {/* Lista de usuarios */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando usuarios...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((otherUser) => (
                    <div
                      key={otherUser.usuario_id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {otherUser.nombre.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {otherUser.nombre} {otherUser.apellido}
                          </p>
                          <p className="text-sm text-gray-500">{otherUser.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {otherUser.rol}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => startConversation(otherUser)}
                        disabled={isCreating}
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {isCreating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversación de Pedido */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                Chat de Pedido
              </h2>

              <p className="text-gray-600 mb-4">
                Crea una conversación vinculada a un pedido específico para coordinar la entrega.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Pedido
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el ID del pedido..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <Button
                  onClick={() => startOrderConversation('test-order-id')}
                  disabled={isCreating}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Crear Chat de Pedido
                    </div>
                  )}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  ¿Qué es un Chat de Pedido?
                </h3>
                <p className="text-sm text-blue-800">
                  Los chats de pedido están vinculados a una orden específica y permiten 
                  coordinar la entrega entre comprador y vendedor. Incluyen información 
                  del pedido y facilitan la comunicación durante el proceso de entrega.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 