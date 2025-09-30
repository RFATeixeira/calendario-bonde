'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc,
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
  customLetter?: string;
}

export default function Home() {
  const { user, loading, isAdminMode } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [usersMap, setUsersMap] = useState<Map<string, { customLetter?: string; displayName: string }>>(new Map());

  // Função para carregar informações atuais dos usuários
  const loadUsersData = async (userIds: string[]) => {
    try {
      const uniqueUserIds = [...new Set(userIds)];
      const newUsersMap = new Map();
      
      for (const userId of uniqueUserIds) {
        try {
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            newUsersMap.set(userId, {
              customLetter: userData.customLetter,
              displayName: userData.displayName || userData.email?.split('@')[0] || 'Usuário'
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar dados do usuário ${userId}:`, error);
        }
      }
      
      setUsersMap(newUsersMap);
    } catch (error) {
      console.error('Erro ao carregar dados dos usuários:', error);
    }
  };

  // Função para recarregar eventos manualmente
  const refreshEvents = async () => {
    if (!user) return;

    setEventsLoading(true);
    
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const eventsData: CalendarEvent[] = [];
      const userIds: string[] = [];
      
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
          customLetter: data.customLetter,
        });
        userIds.push(data.userId);
      });
      
      setEvents(eventsData);
      
      // Carrega dados atuais dos usuários
      if (userIds.length > 0) {
        await loadUsersData(userIds);
      }
    } catch (error) {
      console.error('Erro ao recarregar eventos:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Carregar eventos em tempo real
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const eventsData: CalendarEvent[] = [];
      const userIds: string[] = [];
      
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
          customLetter: data.customLetter,
        });
        userIds.push(data.userId);
      });
      
      setEvents(eventsData);
      setEventsLoading(false);
      
      // Carrega dados atuais dos usuários
      if (userIds.length > 0) {
        await loadUsersData(userIds);
      }
    });

    return unsubscribe;
  }, [user]);



  const handleDateClick = async (date: Date, hasUserEvent: boolean) => {
    if (!user) return;

    // Se for admin no modo admin, abrir modal de seleção
    if (user.isAdmin && isAdminMode) {
      setSelectedDate(date);
      setShowUserModal(true);
      return;
    }

    // Comportamento normal: toque simples adiciona ou remove evento
    const dateStr = formatISO(date, { representation: 'date' });

    if (hasUserEvent) {
      // Remover evento existente do usuário
      const existingEvent = events.find(event => 
        event.date === dateStr && event.userId === user.uid
      );
      
      if (existingEvent) {
        try {
          await deleteDoc(doc(db, 'events', existingEvent.id));
        } catch (error) {
          console.error('Erro ao deletar evento:', error);
          alert('Erro ao desmarcar data. Tente novamente.');
        }
      }
    } else {
      // Adicionar novo evento
      try {
        await addDoc(collection(db, 'events'), {
          date: dateStr,
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL || null,
          title: null,
          createdAt: new Date(),
          createdBy: user.uid,
          customLetter: user.customLetter || null,
        });
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        alert('Erro ao marcar data. Tente novamente.');
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
          customLetter: userData?.customLetter || null,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Calendar
                events={events}
                onDateClick={handleDateClick}
                onRefresh={refreshEvents}
                usersMap={usersMap}
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
