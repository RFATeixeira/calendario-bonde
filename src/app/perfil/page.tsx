'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Edit3, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserStats {
  eventsCreated?: number;
  eventsAttended?: number;
  totalHours?: number;
}

interface UserProfile {
  phone?: string;
  location?: string;
  createdAt?: any;
  lastLogin?: any;
  stats?: UserStats;
}

const PerfilPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    if (!loading && user) {
      fetchUserProfile();
    } else if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  };

  const getInitials = () => {
    if (user?.customLetter) return user.customLetter;
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getJoinedDate = () => {
    if (userProfile?.createdAt) {
      const date = userProfile.createdAt.toDate ? userProfile.createdAt.toDate() : new Date(userProfile.createdAt);
      return date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return null;
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={getDisplayName()}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4 text-white text-2xl font-bold shadow-lg">
              {getInitials()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{getDisplayName()}</h1>
          <p className="text-gray-600 mt-1">{user.isAdmin ? 'Administrador' : 'Usuário'}</p>
          
          <button 
            onClick={() => router.push('/configuracoes')}
            className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition-colors duration-200 flex items-center mx-auto"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Perfil
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{userProfile?.stats?.eventsCreated || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Eventos Criados</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{userProfile?.stats?.eventsAttended || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Participações</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm text-center">
            <p className="text-2xl font-bold text-purple-600">{userProfile?.stats?.totalHours || 0}h</p>
            <p className="text-xs text-gray-600 mt-1">Total Horas</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h2>
          
          <div className="space-y-4">
            {user.email && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            )}
            
            {userProfile?.phone && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Telefone</p>
                  <p className="text-sm text-gray-600">{userProfile.phone}</p>
                </div>
              </div>
            )}
            
            {userProfile?.location && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Localização</p>
                  <p className="text-sm text-gray-600">{userProfile.location}</p>
                </div>
              </div>
            )}
            
            {getJoinedDate() && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Membro desde</p>
                  <p className="text-sm text-gray-600">{getJoinedDate()}</p>
                </div>
              </div>
            )}

            {/* Mostrar informação se não há dados adicionais */}
            {!userProfile?.phone && !userProfile?.location && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Complete seu perfil adicionando mais informações</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements - Apenas se houver dados de estatísticas */}
        {(userProfile?.stats?.eventsCreated || userProfile?.stats?.eventsAttended || 0) > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Conquistas
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {(userProfile?.stats?.eventsCreated || 0) >= 5 && (
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-xs font-medium text-yellow-800">Organizador</p>
                </div>
              )}
              
              {(userProfile?.stats?.eventsAttended || 0) >= 10 && (
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <p className="text-xs font-medium text-blue-800">Participativo</p>
                </div>
              )}
              
              {(userProfile?.stats?.totalHours || 0) >= 50 && (
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="text-xs font-medium text-green-800">Dedicado</p>
                </div>
              )}
              
              {user.isAdmin && (
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🚀</div>
                  <p className="text-xs font-medium text-purple-800">Administrador</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/configuracoes')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Editar Perfil
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Meus Eventos
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;