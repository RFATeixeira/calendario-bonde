'use client';

import { Calendar, Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendário Bonde
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6 glass-card">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Wifi className="h-8 w-8 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Você está offline
              </h2>
              <p className="text-gray-600">
                Verifique sua conexão com a internet e tente novamente.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Tentar Novamente
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Algumas funcionalidades podem estar disponíveis offline quando você estiver conectado.
          </p>
        </div>
      </div>
    </div>
  );
}