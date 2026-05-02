'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    // Inicializar com a letra personalizada ou a primeira letra do nome
    setCustomLetter(user.customLetter || user.displayName.charAt(0).toUpperCase());
    // Inicializar com o nome atual do usuário
    setDisplayName(user.displayName || '');
    // Inicializar cor selecionada
    setSelectedColor((user as any).color || null);
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

  const handleSaveColor = async () => {
    if (!user || !selectedColor) return;

    setSaving(true);
    try {
      // Verificar duplicidade: nenhum outro usuário pode ter a mesma cor
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('color', '==', selectedColor));
      const snapshot = await getDocs(q);

      const conflict = snapshot.docs.find(d => d.id !== user.uid);
      if (conflict) {
        alert('Essa cor já está sendo usada por outro usuário. Escolha outra.');
        setSaving(false);
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        color: selectedColor
      });

      alert('Cor salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cor:', error);
      alert('Erro ao salvar cor. Tente novamente.');
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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Header (glass-pill style como Header.tsx) */}
      <header className="sticky top-0 z-50 px-3 py-2 sm:px-6 sm:py-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl px-6 sm:px-8 py-2.5 sm:py-3">
            <div className="flex items-center justify-between h-10 sm:h-12">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-300" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                  Configurações
                </h1>
              </div>

              <div />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
        <div className="space-y-6">
          {/* Perfil do usuário */}
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Informações do Perfil
            </h2>
            
            <div className="flex items-center space-x-4 mb-6">
              {user.photoURL && !imgError ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                  crossOrigin="anonymous"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-slate-100">{user.displayName}</h3>
                <p className="text-sm text-slate-400">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    Administrador
                  </span>
                )}
              </div>
            </div>

            {/* Editar Nome */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-md font-medium text-slate-100 mb-3">
                Editar Nome de Exibição
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Digite seu nome completo"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Este nome será exibido em todo o aplicativo
                  </p>
                </div>
                
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !displayName.trim() || displayName === user.displayName}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors duration-200"
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
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Personalização do Avatar
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customLetter" className="block text-sm font-medium text-slate-300 mb-2">
                  Letra exibida no calendário
                </label>
                <div className="flex items-center space-x-4">
                  {/* Preview do avatar */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                      ${getUserColor(user.uid, (user as any).color)}
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
                      className="block w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-bold uppercase"
                      placeholder="A"
                    />
                    <p className="text-xs text-slate-400 mt-1">
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
          
            {/* Seleção de cor do usuário */}
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Cor do Marcador</h2>

              <div className="flex items-center gap-3 flex-wrap mb-3">
                {[
                  'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-orange-500','bg-teal-500','bg-cyan-500','bg-lime-500','bg-emerald-500','bg-violet-500','bg-fuchsia-500','bg-rose-500','bg-amber-500'
                ].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-10 h-10 rounded-full ${c} flex items-center justify-center ring-2 ${selectedColor === c ? 'ring-white' : 'ring-transparent'} transition-all`}
                    aria-label={c}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveColor}
                  disabled={saving || !selectedColor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Salvar cor
                </button>
                <button
                  onClick={() => setSelectedColor(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Ações da conta */}
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
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