'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  type: 'evento' | 'lembrete' | 'sistema';
  title: string;
  message: string;
  createdAt: any;
  read: boolean;
  userId: string;
}

const NotificacoesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Primeira tentativa com orderBy (requer índice)
        try {
          const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(notificationsQuery);
          const notificationsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Notification[];

          setNotifications(notificationsData);
        } catch (indexError) {
          console.warn('Índice não disponível, usando query simples:', indexError);
          
          // Fallback: query simples sem orderBy
          const simpleQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(simpleQuery);
          let notificationsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Notification[];

          // Ordenar manualmente no cliente
          notificationsData = notificationsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });

          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        setNotifications([]); // Define como array vazio em caso de erro
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const formatTimeAgo = (createdAt: any) => {
    if (!createdAt) return 'Agora';
    
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const markAllAsRead = async () => {
    if (!user || updatingNotifications) return;

    setUpdatingNotifications(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const clearAllNotifications = async () => {
    if (!user || updatingNotifications) return;
    if (!confirm('Tem certeza que deseja limpar todas as notificações?')) return;

    setUpdatingNotifications(true);
    try {
      for (const notification of notifications) {
        await deleteDoc(doc(db, 'notifications', notification.id));
      }

      setNotifications([]);
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'evento': return AlertCircle;
      case 'lembrete': return Clock;
      case 'sistema': return Check;
      default: return Bell;
    }
  };

  const getColorClasses = (type: string, read: boolean) => {
    const colors = {
      evento: read ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-100 border-blue-200 text-blue-700',
      lembrete: read ? 'bg-yellow-50 border-yellow-100 text-yellow-600' : 'bg-yellow-100 border-yellow-200 text-yellow-700',
      sistema: read ? 'bg-green-50 border-green-100 text-green-600' : 'bg-green-100 border-green-200 text-green-700',
    };
    return colors[type as keyof typeof colors] || colors.evento;
  };

  if (loading || loadingNotifications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 relative">
            <Bell className="w-8 h-8 text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
          </p>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-6">
            <button 
              onClick={markAllAsRead}
              disabled={updatingNotifications || unreadCount === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center"
            >
              {updatingNotifications ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Marcar todas como lidas'
              )}
            </button>
            <button 
              onClick={clearAllNotifications}
              disabled={updatingNotifications}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm"
            >
              Limpar todas
            </button>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Ícone */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getColorClasses(notification.type, notification.read)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-sm text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-600">Você não tem notificações no momento.</p>
          </div>
        )}

        {/* Empty State (caso não tenha notificações) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-400">
              Você está em dia com tudo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificacoesPage;