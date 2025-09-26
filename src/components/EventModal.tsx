'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Calendar, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarEvent {
  id: string;
  date: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title?: string;
  createdAt: Date;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  existingEvents: CalendarEvent[];
  onCreateEvent: (eventData: { date: string; title?: string; userId?: string }) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  users: Array<{ uid: string; displayName: string; photoURL?: string }>;
}

export default function EventModal({
  isOpen,
  onClose,
  selectedDate,
  existingEvents,
  onCreateEvent,
  onDeleteEvent,
  users
}: EventModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSelectedUserId(user?.uid || '');
    }
  }, [isOpen, user]);

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);
    try {
      await onCreateEvent({
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: title.trim() || undefined,
        userId: user?.isAdmin ? selectedUserId : user?.uid
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeleteLoading(eventId);
    try {
      await onDeleteEvent(eventId);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert('Erro ao deletar evento. Tente novamente.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const canDeleteEvent = (event: CalendarEvent) => {
    return user?.isAdmin || event.userId === user?.uid;
  };

  const userHasEventOnDate = existingEvents.some(event => event.userId === user?.uid);

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Eventos existentes */}
          {existingEvents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Agendamentos existentes
              </h4>
              <div className="space-y-2">
                {existingEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${event.userId === user?.uid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {event.userPhoto ? (
                        <img
                          src={event.userPhoto}
                          alt={event.userName}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.userName}
                        </p>
                        {event.title && (
                          <p className="text-xs text-gray-600">{event.title}</p>
                        )}
                      </div>
                    </div>
                    
                    {canDeleteEvent(event) && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleteLoading === event.id}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors duration-200 disabled:opacity-50"
                        title="Remover agendamento"
                      >
                        {deleteLoading === event.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulário para novo evento */}
          {(!userHasEventOnDate || user?.isAdmin) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Novo agendamento
              </h4>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião, Consulta, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {user?.isAdmin && (
                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário
                  </label>
                  <select
                    id="user"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!user?.isAdmin && !selectedUserId)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </div>
                ) : (
                  'Criar Agendamento'
                )}
              </button>
            </form>
          )}

          {userHasEventOnDate && !user?.isAdmin && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Você já tem um agendamento nesta data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}