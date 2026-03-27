'use client';

import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, TrendingUp, Calendar, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCachedData, setCachedData } from '@/lib/clientCache';

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
}

const HOME_STATS_CACHE_TTL_MS = 1000 * 60 * 3;

const HomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ totalEvents: 0, totalUsers: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const cacheKey = `home:stats:${user?.uid}`;

      const cachedStats = getCachedData<DashboardStats>(cacheKey, HOME_STATS_CACHE_TTL_MS);
      if (cachedStats) {
        setStats(cachedStats);
        setLoadingStats(false);
      }

      try {
        // Buscar total de eventos
        const eventsQuery = query(collection(db, 'events'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        // Buscar total de usuários
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);

        const freshStats = {
          totalEvents: eventsSnapshot.size,
          totalUsers: usersSnapshot.size
        };

        setStats(freshStats);
        setCachedData(cacheKey, freshStats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Em caso de erro, manter valores padrão
        if (!cachedStats) {
          setStats({
            totalEvents: 0,
            totalUsers: 0
          });
        }
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <HomeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Bem-vindo, {getDisplayName()}!</h1>
          <p className="text-slate-300 mt-2">Dashboard do Calendário Bonde</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Eventos</p>
                {loadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-100">{stats.totalEvents}</p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Usuários</p>
                {loadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-green-500 mr-2" />
                    <span className="text-sm text-gray-500">...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-100">{stats.totalUsers}</p>
                )}
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Ações Rápidas</h2>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Ir para Calendário
            </button>
            
            <button 
              onClick={() => router.push('/perfil')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Ver Perfil
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Calendário Bonde</h2>
          
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Gerencie seus eventos e compromissos de forma simples e eficiente.
            </p>
            
            {stats.totalEvents === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                  👋 Você ainda não tem eventos! Comece criando seu primeiro evento no calendário.
                </p>
              </div>
            )}
            
            {user.isAdmin && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  🚀 Você tem privilégios de administrador. Acesse as configurações para gerenciar o sistema.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;