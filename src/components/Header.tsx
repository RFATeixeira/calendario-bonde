'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, Settings, User, Shield, ShieldOff } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout, isAdminMode, toggleAdminMode } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Calendário Bonde
            </h1>
          </div>

          {/* Controles e Menu */}
          <div className="flex items-center space-x-4">
            {/* Botão modo administrador - só visível para admins */}
            {user?.isAdmin && (
              <button
                onClick={toggleAdminMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isAdminMode
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'hover:bg-gray-100'
                }`}
                title={isAdminMode ? 'Desativar modo administrador' : 'Ativar modo administrador'}
              >
                {isAdminMode ? (
                  <Shield className="h-5 w-5 text-blue-600" />
                ) : (
                  <ShieldOff className="h-5 w-5 text-gray-700" />
                )}
              </button>
            )}

            {/* Menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName}
                  </p>
                  {user?.isAdmin && (
                    <p className="text-xs text-blue-600 font-medium">
                      Administrador
                    </p>
                  )}
                </div>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 glass-card">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}