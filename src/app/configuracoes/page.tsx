'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ArrowLeft, User, LogOut, Save } from 'lucide-react';
import { getUserColor } from '@/lib/userColors';

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [customLetter, setCustomLetter] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    // Inicializar com a letra personalizada ou a primeira letra do nome
    setCustomLetter(user.customLetter || user.displayName.charAt(0).toUpperCase());
    // Inicializar com o nome atual do usuário
    setDisplayName(user.displayName || '');
  }, [user, router]);

  const handleSave = async () => {
    if (!user || !customLetter.trim()) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        customLetter: customLetter.trim().toUpperCase().charAt(0)
      });
      
      alert('Letra personalizada salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar letra personalizada:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return;

    setSavingName(true);
    try {
      const trimmedName = displayName.trim();
      
      // Atualizar no Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: trimmedName
        });
      }
      
      // Atualizar no Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: trimmedName
      });
      
      alert('Nome alterado com sucesso!');
      
      // Recarregar a página para refletir as mudanças no contexto de autenticação
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
      alert('Erro ao salvar nome. Tente novamente.');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja desconectar?')) {
      setLoading(true);
      try {
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Erro no logout:', error);
        setLoading(false);
      }
    }
  };

  const handleLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().charAt(0);
    setCustomLetter(value);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Configurações
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Perfil do usuário */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Perfil
            </h2>
            
            <div className="flex items-center space-x-4 mb-6">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.displayName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    Administrador
                  </span>
                )}
              </div>
            </div>

            {/* Editar Nome */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Editar Nome de Exibição
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Digite seu nome completo"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este nome será exibido em todo o aplicativo
                  </p>
                </div>
                
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !displayName.trim() || displayName === user.displayName}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  {savingName ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Nome
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Configuração da letra */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personalização do Avatar
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Letra exibida no calendário
                </label>
                <div className="flex items-center space-x-4">
                  {/* Preview do avatar */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                      ${getUserColor(user.uid)}
                    `}
                  >
                    {customLetter}
                  </div>
                  
                  {/* Input para a letra */}
                  <div className="flex-1">
                    <input
                      type="text"
                      id="customLetter"
                      value={customLetter}
                      onChange={handleLetterChange}
                      maxLength={1}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-bold uppercase"
                      placeholder="A"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite apenas uma letra para representar você no calendário
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !customLetter.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Letra
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ações da conta */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ações da Conta
            </h2>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Desconectando...
                </div>
              ) : (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  Desconectar
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}