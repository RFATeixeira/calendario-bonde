'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User, Shield, ShieldOff } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout, isAdminMode, toggleAdminMode } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 px-3 py-2 sm:px-6 sm:py-3">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl px-6 sm:px-8 py-2.5 sm:py-3">
          <div className="flex justify-between items-center h-10 sm:h-12">
          {/* Logo e título */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center">
              <img
                src="/icon/logo-white.png"
                alt="Calendário Bonde"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
              Calendário Bonde
            </h1>
          </div>

          {/* Controles e Menu */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {/* Botão modo administrador - só visível para admins */}
            {user?.isAdmin && (
              <button
                onClick={toggleAdminMode}
                className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
                  isAdminMode
                    ? 'bg-blue-500/20 hover:bg-blue-500/30'
                    : 'hover:bg-slate-800'
                }`}
                title={isAdminMode ? 'Desativar modo administrador' : 'Ativar modo administrador'}
              >
                {isAdminMode ? (
                  <Shield className="h-5 w-5 sm:h-5 sm:w-5 text-blue-600" />
                ) : (
                  <ShieldOff className="h-5 w-5 sm:h-5 sm:w-5 text-slate-300" />
                )}
              </button>
            )}

            {/* Menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              {user?.photoURL && !imgError ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                  crossOrigin="anonymous"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
                  <div className="hidden sm:block text-left">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      // perfil removido: não navegar
                    }}
                    className="text-sm font-medium text-slate-100 cursor-pointer"
                  >
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
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-lg border border-slate-700 py-2 z-50 glass-card">
                  <div
                    className="px-4 py-2 border-b border-slate-700 cursor-default"
                    onClick={() => {
                      setShowDropdown(false);
                      // perfil removido: não navegar
                    }}
                  >
                    <p className="text-sm font-medium text-slate-100">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  
                  {user?.isAdmin && (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/admin');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Administração</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/configuracoes');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors duration-200"
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
      </div>
    </header>
  );
}