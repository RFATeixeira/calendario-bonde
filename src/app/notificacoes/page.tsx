'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCachedData, setCachedData } from '@/lib/clientCache';

interface Notification {
  id: string;
  type: 'evento' | 'lembrete' | 'sistema';
  title: string;
  message: string;
  createdAt: any;
  read: boolean;
  userId: string;
}

const NOTIFICATIONS_CACHE_TTL_MS = 1000 * 60 * 2;

const resolveDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const NotificacoesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    type: 'sistema' as 'evento' | 'lembrete' | 'sistema',
    title: '',
    message: '',
    targetType: 'all' as 'all' | 'specific'
  });
  const [creatingNotification, setCreatingNotification] = useState(false);
  
  // Log admin status for debugging
  useEffect(() => {
    if (user) {
      console.log('👤 User admin status:', user.isAdmin);
      console.log('👤 User email:', user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      const cacheKey = `notificacoes:list:${user.uid}`;
      const cachedNotifications = getCachedData<Notification[]>(cacheKey, NOTIFICATIONS_CACHE_TTL_MS);
      if (cachedNotifications) {
        setNotifications(cachedNotifications);
        setLoadingNotifications(false);
      }

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
          setCachedData(cacheKey, notificationsData);
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
            const dateA = resolveDate(a.createdAt) || new Date(0);
            const dateB = resolveDate(b.createdAt) || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

          setNotifications(notificationsData);
          setCachedData(cacheKey, notificationsData);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        if (!cachedNotifications) {
          setNotifications([]); // Define como array vazio em caso de erro
        }
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
    
    const date = resolveDate(createdAt) || new Date();
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

      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      setCachedData(`notificacoes:list:${user.uid}`, updatedNotifications);
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
      setCachedData(`notificacoes:list:${user.uid}`, []);
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const clearAllNotificationsAdmin = async () => {
    if (!user || !user.isAdmin || updatingNotifications) return;
    if (!confirm('⚠️ ADMIN: Tem certeza que deseja apagar TODAS as notificações de TODOS os usuários? Esta ação não pode ser desfeita!')) return;
    if (!confirm('⚠️ CONFIRMAÇÃO FINAL: Esta ação irá apagar todas as notificações do sistema. Continuar?')) return;

    setUpdatingNotifications(true);
    try {
      // Buscar todas as notificações do sistema
      const allNotificationsQuery = query(collection(db, 'notifications'));
      const allNotificationsSnapshot = await getDocs(allNotificationsQuery);
      
      console.log(`🗑️ Admin deletando ${allNotificationsSnapshot.docs.length} notificações do sistema`);
      
      // Deletar todas as notificações
      const deletePromises = allNotificationsSnapshot.docs.map(docSnapshot => 
        deleteDoc(docSnapshot.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Limpar lista local
      setNotifications([]);
      setCachedData(`notificacoes:list:${user.uid}`, []);
      
      alert(`✅ ${allNotificationsSnapshot.docs.length} notificações foram removidas do sistema.`);
    } catch (error) {
      console.error('Erro ao limpar todas as notificações (admin):', error);
      alert('❌ Erro ao limpar notificações. Tente novamente.');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminForm.title.trim() || !adminForm.message.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setCreatingNotification(true);
    try {
      if (adminForm.targetType === 'all') {
        // Create notification for all users
        // First, get all users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Create notification for each user
        const notificationPromises = usersSnapshot.docs.map(async (userDoc) => {
          const notificationData = {
            type: adminForm.type,
            title: adminForm.title,
            message: adminForm.message,
            read: false,
            createdAt: new Date(),
            userId: userDoc.id
          };
          
          return addDoc(collection(db, 'notifications'), notificationData);
        });
        
        await Promise.all(notificationPromises);
        console.log(`Notificação criada para ${usersSnapshot.docs.length} usuários`);
      } else {
        // For specific users - for now, we'll implement this later
        console.log('Funcionalidade de usuários específicos será implementada futuramente');
      }
      
      // Reset form and close modal
      setAdminForm({
        type: 'sistema',
        title: '',
        message: '',
        targetType: 'all'
      });
      setShowAdminModal(false);
      alert('Notificação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      alert('Erro ao criar notificação. Tente novamente.');
    } finally {
      setCreatingNotification(false);
    }
  };

  const handleAdminFormChange = (field: string, value: string) => {
    setAdminForm(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-4">
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
          <h1 className="text-2xl font-bold text-slate-100">Notificações</h1>
          <p className="text-slate-300 mt-2">
            {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
          </p>
        </div>

        {/* Admin Button - Only for admin users */}
        {user?.isAdmin && (
          <div className="mb-6">
            <button 
              onClick={() => setShowAdminModal(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Notificação
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="space-y-3 mb-6">
            {/* Regular user buttons */}
            <div className="flex gap-2">
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
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-slate-200 font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm"
              >
                Limpar todas
              </button>
            </div>
            
            {/* Admin button */}
            {user?.isAdmin && (
              <button 
                onClick={clearAllNotificationsAdmin}
                disabled={updatingNotifications}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                {updatingNotifications ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    🛡️ Admin: Limpar TODAS as notificações do sistema
                  </>
                )}
              </button>
            )}
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
                  className={`relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Ícone */}
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getColorClasses(notification.type, notification.read)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-slate-100' : 'text-slate-300'
                        }`}>
                          {notification.title}
                        </h3>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-slate-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-sm text-center">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Nenhuma notificação</h3>
            <p className="text-slate-400">Você não tem notificações no momento.</p>
          </div>
        )}

        {/* Empty State (caso não tenha notificações) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-slate-500">
              Você está em dia com tudo!
            </p>
          </div>
        )}
      </div>

      {/* Admin Modal for Creating Notifications */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">Criar Notificação</h2>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAdminFormSubmit} className="space-y-4">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Notificação
                </label>
                <select 
                  value={adminForm.type}
                  onChange={(e) => handleAdminFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sistema">Sistema</option>
                  <option value="evento">Evento</option>
                  <option value="lembrete">Lembrete</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Título
                </label>
                <input 
                  type="text" 
                  value={adminForm.title}
                  onChange={(e) => handleAdminFormChange('title', e.target.value)}
                  placeholder="Digite o título da notificação"
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mensagem
                </label>
                <textarea 
                  value={adminForm.message}
                  onChange={(e) => handleAdminFormChange('message', e.target.value)}
                  placeholder="Digite a mensagem da notificação"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Target Users */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Destinatários
                </label>
                <select 
                  value={adminForm.targetType}
                  onChange={(e) => handleAdminFormChange('targetType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os usuários</option>
                  <option value="specific">Usuários específicos</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={creatingNotification}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {creatingNotification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Notificação'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesPage;