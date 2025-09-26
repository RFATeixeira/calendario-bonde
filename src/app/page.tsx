'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatISO } from 'date-fns';

import LoginComponent from '@/components/LoginComponent';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import UserLegend from '@/components/UserLegend';
import UserSelectionModal from '@/components/UserSelectionModal';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

interface CalendarEvent {
  id: string;
  date: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title?: string;
  createdAt: Date;
}

export default function Home() {
  const { user, loading, isAdminMode } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Carregar eventos em tempo real
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: CalendarEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          date: data.date,
          userId: data.userId,
          userName: data.userName,
          userPhoto: data.userPhoto,
          title: data.title,
          createdAt: data.createdAt.toDate(),
        });
      });
      setEvents(eventsData);
      setEventsLoading(false);
    });

    return unsubscribe;
  }, [user]);



  const handleDateClick = async (date: Date) => {
    if (!user) return;

    // Se está no modo admin, mostrar modal de seleção de usuário
    if (user.isAdmin && isAdminMode) {
      setSelectedDate(date);
      setShowUserModal(true);
      return;
    }

    // Comportamento normal para usuários não-admin ou admin não no modo admin
    const dateStr = formatISO(date, { representation: 'date' });
    const existingEvent = events.find(event => 
      event.date === dateStr && event.userId === user.uid
    );

    if (!existingEvent) {
      // Marcar data - criar novo evento
      try {
        await addDoc(collection(db, 'events'), {
          date: dateStr,
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL || null,
          title: null,
          createdAt: new Date(),
          createdBy: user.uid,
        });
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        alert('Erro ao marcar data. Tente novamente.');
      }
    }
  };

  const handleDateLongPress = async (date: Date) => {
    if (!user) return;

    // No modo admin, long press também abre o modal
    if (user.isAdmin && isAdminMode) {
      setSelectedDate(date);
      setShowUserModal(true);
      return;
    }

    const dateStr = formatISO(date, { representation: 'date' });
    const existingEvent = events.find(event => 
      event.date === dateStr && event.userId === user.uid
    );

    if (existingEvent) {
      // Desmarcar data - remover evento
      try {
        await deleteDoc(doc(db, 'events', existingEvent.id));
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
        alert('Erro ao desmarcar data. Tente novamente.');
      }
    }
  };

  const handleUserSelect = async (userId: string, userName: string) => {
    if (!user || !selectedDate) return;

    const dateStr = formatISO(selectedDate, { representation: 'date' });
    const existingEvent = events.find(event => 
      event.date === dateStr && event.userId === userId
    );

    if (existingEvent) {
      // Se já existe evento para este usuário nesta data, remover
      try {
        await deleteDoc(doc(db, 'events', existingEvent.id));
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
        alert('Erro ao desmarcar data. Tente novamente.');
      }
    } else {
      // Criar novo evento para o usuário selecionado
      try {
        // Buscar dados do usuário selecionado
        const userDoc = await getDocs(collection(db, 'users'));
        const userData = userDoc.docs.find(doc => doc.id === userId)?.data();
        
        await addDoc(collection(db, 'events'), {
          date: dateStr,
          userId: userId,
          userName: userData?.displayName || userName,
          userPhoto: userData?.photoURL || null,
          title: null,
          createdAt: new Date(),
          createdBy: user.uid, // Quem criou foi o admin
        });
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        alert('Erro ao marcar data. Tente novamente.');
      }
    }

    setSelectedDate(null);
    setShowUserModal(false);
  };



  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        <ServiceWorkerRegistration />
        <LoginComponent />
      </>
    );
  }

  return (
    <>
      <ServiceWorkerRegistration />
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Calendar
                events={events}
                onDateClick={handleDateClick}
                onDateLongPress={handleDateLongPress}
                currentUser={user}
              />
              <UserLegend 
                events={events}
                currentUser={user}
              />
            </>
          )}
        </main>

        {/* Modal de seleção de usuário */}
        <UserSelectionModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedDate(null);
          }}
          onUserSelect={handleUserSelect}
          currentUser={user}
        />
      </div>
    </>
  );
}
