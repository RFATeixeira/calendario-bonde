'use client';

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths,
  isToday,
  parseISO,
  formatISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { getUserColor } from '@/lib/userColors';
import { getUserDisplayLetter } from '@/lib/userUtils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from './PullToRefreshIndicator';

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

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (date: Date, hasUserEvent: boolean) => void;
  onRefresh?: () => Promise<void> | void;
  usersMap?: Map<string, { customLetter?: string; displayName: string }>;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    customLetter?: string;
  };
}

export default function Calendar({ events, onDateClick, onRefresh, usersMap, currentUser }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sistema de pull-to-refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // Fallback: recarrega a página
      window.location.reload();
    }
  };

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh,
    pullProgress
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 15, // 15% da tela - muito mais fácil
    resistance: 2.0 // Reduzida a resistência também
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatISO(date, { representation: 'date' });
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const hasUserEvent = dayEvents.some(event => event.userId === currentUser.uid);
    onDateClick(date, hasUserEvent);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mx-6">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <div className="grid grid-cols-7 gap-2 mb-4">
        {daysOfWeek.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Função para obter a letra de exibição atual do usuário
  const getCurrentUserLetter = (userId: string, userName: string, eventCustomLetter?: string): string => {
    // 1. Se for o usuário atual, sempre usa a customLetter mais recente do contexto
    if (userId === currentUser.uid && currentUser.customLetter) {
      return currentUser.customLetter;
    }
    
    // 2. Se temos dados atualizados no usersMap, usa de lá
    if (usersMap && usersMap.has(userId)) {
      const userData = usersMap.get(userId);
      if (userData?.customLetter) {
        return userData.customLetter;
      }
    }
    
    // 3. Se não, usa a customLetter salva no evento (pode estar desatualizada)
    if (eventCustomLetter) {
      return eventCustomLetter;
    }
    
    // 4. Fallback: primeira letra do nome
    return userName.charAt(0).toUpperCase();
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);
        const hasUserEvent = dayEvents.some(event => event.userId === currentUser.uid);

        days.push(
          <div
            key={day.toString()}
            className={`
              relative min-h-[100px] p-3 border cursor-pointer calendar-cell transition-all duration-200
              ${!isCurrentMonth 
                ? 'bg-gray-100 text-gray-500 border-gray-200' 
                : 'bg-white text-gray-900 border-gray-300'
              }
              ${isTodayDate ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300' : ''}
              ${hasUserEvent ? 'ring-2 ring-blue-200 border-blue-300' : ''}
              hover:bg-gray-100 hover:scale-105 active:scale-95
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`
                text-sm font-medium
                ${isTodayDate ? 'text-blue-600 font-bold' : ''}
              `}>
                {format(day, 'd')}
              </span>
            </div>
            
            {isCurrentMonth && dayEvents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm user-avatar shadow-md
                      ${getUserColor(event.userId)}
                    `}
                    title={event.userName}
                  >
                    {getCurrentUserLetter(event.userId, event.userName, event.customLetter)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <>
      {/* Indicador de Pull-to-Refresh */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        shouldRefresh={shouldRefresh}
        pullProgress={pullProgress}
      />

      {/* Calendar Container com ajuste para pull-to-refresh */}
      <div 
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 glass-card transition-transform duration-200 ease-out"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${Math.max(0, pullDistance * 0.1)}px)` : 'translateY(0)',
          marginTop: isPulling || isRefreshing ? '20px' : '0px'
        }}
      >
        {renderHeader()}
        {renderDaysOfWeek()}
        {renderCells()}
      </div>
    </>
  );
}