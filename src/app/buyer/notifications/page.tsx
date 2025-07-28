'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { 
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface Notification {
  notificacion_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  es_leida: boolean;
  fecha_creacion: string;
  datos_adicionales?: any;
}

export default function BuyerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (user && user.rol === 'comprador') {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {};
      if (filter === 'unread') filters.es_leida = false;
      if (filter === 'read') filters.es_leida = true;

      const response = await buyerService.getNotifications(user!.usuario_id, filters);
      setNotifications(response.notificaciones || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await buyerService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.notificacion_id === notificationId 
            ? { ...notif, es_leida: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await buyerService.markAllNotificationsAsRead(user!.usuario_id);
      setNotifications(prev => prev.map(notif => ({ ...notif, es_leida: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return <ShoppingBagIcon className="h-6 w-6 text-blue-600" />;
      case 'entrega':
        return <TruckIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return 'border-blue-200 bg-blue-50';
      case 'entrega':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'comprador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Acceso Denegado</div>
          <p className="text-gray-600">Solo los compradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.es_leida).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => 
        filter === 'unread' ? !n.es_leida : n.es_leida
      );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                <p className="text-gray-600 mt-2">
                  Mantente informado sobre tus pedidos y actividades
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={filter === 'all' ? 'bg-blue-600 text-white' : ''}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                onClick={() => setFilter('unread')}
                variant={filter === 'unread' ? 'default' : 'outline'}
                className={filter === 'unread' ? 'bg-blue-600 text-white' : ''}
              >
                No leídas ({unreadCount})
              </Button>
              <Button
                onClick={() => setFilter('read')}
                variant={filter === 'read' ? 'default' : 'outline'}
                className={filter === 'read' ? 'bg-blue-600 text-white' : ''}
              >
                Leídas ({notifications.length - unreadCount})
              </Button>
            </div>
          </div>

          {/* Lista de Notificaciones */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No tienes notificaciones' : 
                   filter === 'unread' ? 'No tienes notificaciones sin leer' : 
                   'No tienes notificaciones leídas'}
                </h3>
                <p className="text-gray-600">
                  {filter === 'all' ? 'Cuando tengas notificaciones aparecerán aquí.' :
                   filter === 'unread' ? 'Todas tus notificaciones han sido leídas.' :
                   'Aún no has leído ninguna notificación.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.notificacion_id}
                  className={`border rounded-lg p-4 ${getNotificationColor(notification.tipo)} ${
                    !notification.es_leida ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.titulo}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.fecha_creacion)}
                          </span>
                          {!notification.es_leida && (
                            <Button
                              onClick={() => markAsRead(notification.notificacion_id)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <CheckIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.mensaje}
                      </p>
                      
                      {notification.datos_adicionales && (
                        <div className="mt-2 text-xs text-gray-500">
                          {/* Aquí se pueden mostrar datos adicionales según el tipo de notificación */}
                        </div>
                      )}
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