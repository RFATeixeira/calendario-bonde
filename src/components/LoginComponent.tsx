'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Calendar, Users, Shield } from 'lucide-react';

export default function LoginComponent() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Calendário Bonde
          </h2>
          <p className="text-gray-600">
            Sistema de agendamento compartilhado
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 glass-card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Agendamentos compartilhados</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Login seguro com Google</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Interface intuitiva</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar com Google
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Ao fazer login, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}