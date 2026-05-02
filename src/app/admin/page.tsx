"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Save } from 'lucide-react';

interface UserItem {
  uid: string;
  displayName: string;
  email?: string;
  customLetter?: string;
  color?: string;
  isAdmin?: boolean;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<UserItem | null>(null);
  const [modalLetter, setModalLetter] = useState('');
  const [modalColor, setModalColor] = useState('bg-blue-500');
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.isAdmin) {
      router.push('/');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const q = collection(db, 'users');
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
        setUsers(list as UserItem[]);
      } catch (err) {
        console.error('Erro ao carregar usuários', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, router]);

  const openModal = (u: UserItem) => {
    setModalUser(u);
    setModalLetter(u.customLetter || '');
    setModalColor(u.color || 'bg-blue-500');
    setModalOpen(true);
  };

  const isTailwindClass = (c?: string) => typeof c === 'string' && c.startsWith('bg-');

  const closeModal = () => {
    setModalOpen(false);
    setModalUser(null);
  };

  const saveModal = async () => {
    if (!modalUser) return;
    setModalSaving(true);
    try {
      await updateDoc(doc(db, 'users', modalUser.uid), {
        customLetter: modalLetter || null,
        color: modalColor || null
      });
      setUsers(prev => prev.map(u => u.uid === modalUser.uid ? { ...u, customLetter: modalLetter || undefined, color: modalColor || undefined } : u));
      closeModal();
    } catch (err) {
      console.error('Erro ao salvar usuário', err);
      alert('Erro ao salvar. Veja console para detalhes.');
    } finally {
      setModalSaving(false);
    }
  };

  const deleteModalUser = async () => {
    if (!modalUser) return;
    // Prevent deleting yourself
    if (modalUser.uid === user?.uid) {
      alert('Você não pode deletar seu próprio usuário.');
      return;
    }

    if (!confirm(`Confirma exclusão do usuário "${modalUser.displayName}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteDoc(doc(db, 'users', modalUser.uid));
      setUsers(prev => prev.filter(u => u.uid !== modalUser.uid));
      closeModal();
      alert('Usuário deletado com sucesso.');
    } catch (err) {
      console.error('Erro ao deletar usuário', err);
      alert('Erro ao deletar usuário. Veja console para detalhes.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950">
      <header className="sticky top-0 z-50 px-3 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl px-6 sm:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200">
                  <ArrowLeft className="h-5 w-5 text-slate-300" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Administração — Usuários</h1>
              </div>
              <div />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 space-y-4">
          {loading ? (
            <div className="text-slate-300">Carregando usuários...</div>
          ) : (
            users.map(u => (
              <div key={u.uid} className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-lg border border-slate-700">
                <div className="flex-1 min-w-0">
                  <div className="text-slate-100 font-medium truncate">{u.displayName} {u.isAdmin && <span className="text-xs text-blue-400 ml-2">(Admin)</span>}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(u)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${isTailwindClass(u.color) ? u.color : ''}`}
                    style={!isTailwindClass(u.color) ? { background: u.color || undefined } : undefined}
                    title="Editar letra e cor"
                  >
                    {u.customLetter || u.displayName.charAt(0).toUpperCase()}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      {modalOpen && modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Editar usuário — {modalUser.displayName}</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${isTailwindClass(modalColor) ? modalColor : ''}`} style={!isTailwindClass(modalColor) ? { background: modalColor } : undefined}>
                {modalLetter || modalUser.displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Letra</label>
                  <input
                    value={modalLetter}
                    onChange={(e) => setModalLetter(e.target.value.toUpperCase().charAt(0) || '')}
                    maxLength={1}
                    className="w-20 px-2 py-1 rounded-xl text-center bg-slate-800 text-white border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Cor</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-orange-500','bg-teal-500','bg-cyan-500','bg-lime-500','bg-emerald-500','bg-violet-500','bg-fuchsia-500','bg-rose-500','bg-amber-500'
                    ].map(c => (
                      <button
                        key={c}
                        onClick={() => setModalColor(c)}
                        className={`w-10 h-10 rounded-full ${c} flex items-center justify-center ring-2 ${modalColor === c ? 'ring-white' : 'ring-transparent'} transition-all`}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 hover:bg-slate-600">Cancelar</button>
                <button onClick={deleteModalUser} disabled={modalUser?.uid === user?.uid} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" title={modalUser?.uid === user?.uid ? 'Não é possível deletar seu próprio usuário' : 'Deletar usuário'}>Excluir</button>
              </div>
              <div>
                <button onClick={saveModal} disabled={modalSaving} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{modalSaving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
