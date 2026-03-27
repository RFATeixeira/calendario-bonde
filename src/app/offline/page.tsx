'use client';

import { Calendar, Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto h-20 w-20 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Calendário Bonde
          </h1>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-8 space-y-6 glass-card">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
              <Wifi className="h-8 w-8 text-blue-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-100">
                Você está offline
              </h2>
              <p className="text-slate-300">
                Verifique sua conexão com a internet e tente novamente.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Tentar Novamente
          </button>
        </div>

        <div className="text-sm text-slate-400">
          <p>
            Algumas funcionalidades podem estar disponíveis offline quando você estiver conectado.
          </p>
        </div>
      </div>
    </div>
  );
}