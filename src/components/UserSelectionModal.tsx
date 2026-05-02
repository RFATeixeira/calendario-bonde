'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, User } from 'lucide-react';
import { getUserColor } from '@/lib/userColors';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  customLetter?: string;
  color?: string;
}

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string, userName: string) => void;
  currentUser: UserData;
}

export default function UserSelectionModal({ 
  isOpen, 
  onClose, 
  onUserSelect, 
  currentUser 
}: UserSelectionModalProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];
      
      // Ordenar usuários: admin primeiro, depois alfabeticamente
      const sortedUsers = usersData.sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserData) => {
    onUserSelect(user.uid, user.displayName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">
            Selecionar Usuário
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-300 mb-4">
            Selecione o usuário para quem deseja definir este dia:
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 text-left"
                >
                  {/* Avatar do usuário */}
                  <div className="shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${getUserColor(user.uid, (user as any).color)}
                      `}>
                        {user.customLetter || user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Informações do usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-slate-100 truncate">
                        {user.displayName}
                      </p>
                      {user.isAdmin && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                      {user.uid === currentUser.uid && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}