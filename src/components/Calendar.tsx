'use client';

import type { CalendarEvent } from '@/types';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserColor } from '@/lib/userColors';
import { getUserDisplayLetter } from '@/lib/userUtils';

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (date: Date, hasUserEvent: boolean) => void;
  usersMap?: Map<string, { customLetter?: string; displayName: string; color?: string }>;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
    customLetter?: string;
    color?: string;
  };
}

export default function Calendar({ events, onDateClick, usersMap, currentMonth, onMonthChange, currentUser }: CalendarProps) {

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const nextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
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
          className="p-2 hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5 text-slate-300" />
        </button>
        <h2 className="text-2xl font-bold text-slate-100 mx-6">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <div className="grid grid-cols-7 gap-1 mb-4">
        {daysOfWeek.map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-slate-300 bg-slate-800 rounded-lg border border-slate-700">
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
                relative min-h-[96px] p-2 border cursor-pointer calendar-cell transition-all duration-200
                ${!isCurrentMonth 
                  ? 'bg-slate-900/70 text-slate-500 border-slate-800' 
                  : 'bg-slate-900 text-slate-100 border-slate-700'
                }
                ${isTodayDate ? 'bg-linear-to-br from-blue-950/60 to-slate-900 border-blue-400' : ''}
                ${hasUserEvent ? 'ring-2 ring-blue-500/40 border-blue-500' : ''}
                hover:bg-slate-800 hover:scale-105 active:scale-95
              `}
              onClick={() => handleDateClick(cloneDay)}
            >
              <div className="flex items-center justify-center mb-2">
                <span className={`
                  text-sm font-medium text-center block w-full
                  ${isTodayDate ? 'text-blue-300 font-bold' : 'text-slate-200'}
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
                      ${getUserColor(
                        event.userId,
                        // preferir cor salva no usersMap, se existir; senão usar cor do evento; por fim, cor do usuário atual
                        (usersMap && usersMap.get(event.userId)?.color) || event.color || (event.userId === currentUser.uid ? (currentUser as any).color : undefined)
                      )}
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
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 glass-card">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}