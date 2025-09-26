'use client';

import { Calendar } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse shadow-xl">
          <Calendar className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    </div>
  );
}