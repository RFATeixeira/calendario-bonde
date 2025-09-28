'use client';

import { getUserColor } from '@/lib/userColors';
import { Users } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title?: string;
  createdAt: Date;
  customLetter?: string;
}

interface UserLegendProps {
  events: CalendarEvent[];
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    customLetter?: string;
  };
}

export default function UserLegend({ events, currentUser }: UserLegendProps) {
  // Obter usuários únicos dos eventos
  const uniqueUsers = events.reduce((users, event) => {
    if (!users.find(user => user.userId === event.userId)) {
      users.push({
        userId: event.userId,
        userName: event.userName,
        userPhoto: event.userPhoto,
        customLetter: event.customLetter
      });
    }
    return users;
  }, [] as Array<{userId: string, userName: string, userPhoto?: string, customLetter?: string}>);

  // Adicionar o usuário atual se ele não estiver na lista
  if (!uniqueUsers.find(user => user.userId === currentUser.uid)) {
    uniqueUsers.push({
      userId: currentUser.uid,
      userName: currentUser.displayName,
      userPhoto: currentUser.photoURL,
      customLetter: currentUser.customLetter
    });
  }

  // Ordenar usuários: usuário atual primeiro, depois por nome
  uniqueUsers.sort((a, b) => {
    if (a.userId === currentUser.uid) return -1;
    if (b.userId === currentUser.uid) return 1;
    return a.userName.localeCompare(b.userName);
  });

  if (uniqueUsers.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 glass-card">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Usuários
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {uniqueUsers.map((user) => {
          const eventCount = events.filter(event => event.userId === user.userId).length;
          const isCurrentUser = user.userId === currentUser.uid;
          
          return (
            <div
              key={user.userId}
              className={`
                flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:scale-105
                ${isCurrentUser 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              {/* Avatar com cor única do usuário */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm user-avatar shadow-lg
                  ${getUserColor(user.userId)}
                `}
                title={user.userName}
              >
                {user.customLetter || user.userName.charAt(0).toUpperCase()}
              </div>

              {/* Informações do usuário */}
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-medium truncate
                  ${isCurrentUser 
                    ? 'text-blue-700' 
                    : 'text-gray-900'
                  }
                `}>
                  {isCurrentUser ? 'Você' : user.userName}
                </p>
                <p className="text-xs text-gray-600">
                  {eventCount} {eventCount === 1 ? 'agendamento' : 'agendamentos'}
                </p>
              </div>

              {/* Badge de admin se for o caso */}
              {user.userId === currentUser.uid && currentUser.isAdmin && (
                <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                  Admin
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span>{uniqueUsers.length} {uniqueUsers.length === 1 ? 'usuário' : 'usuários'}</span>
          <span>{events.length} {events.length === 1 ? 'agendamento' : 'agendamentos'} total</span>
        </div>
      </div>
    </div>
  );
}