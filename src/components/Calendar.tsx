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
  onDateClick: (date: Date) => void;
  onDateLongPress: (date: Date) => void;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
    isAdmin: boolean;
  };
}

export default function Calendar({ events, onDateClick, onDateLongPress, currentUser }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressedDate, setPressedDate] = useState<Date | null>(null);

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

  const handleMouseDown = (date: Date) => {
    setPressedDate(date);
    const timer = setTimeout(() => {
      onDateLongPress(date);
      setPressTimer(null);
      setPressedDate(null);
    }, 1000);
    setPressTimer(timer);
  };

  const handleMouseUp = (date: Date) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      setPressedDate(null);
      onDateClick(date);
    }
  };

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      setPressedDate(null);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Hoje</span>
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
        const isPressing = pressedDate && isSameDay(day, pressedDate);

        days.push(
          <div
            key={day.toString()}
            className={`
              relative min-h-[100px] p-3 border cursor-pointer calendar-cell
              ${!isCurrentMonth 
                ? 'bg-gray-100 text-gray-500 border-gray-200' 
                : 'bg-white text-gray-900 border-gray-300'
              }
              ${isTodayDate ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300' : ''}
              ${isPressing ? 'calendar-day-pressing scale-95' : ''}
              hover:bg-gray-100
            `}
            onMouseDown={() => handleMouseDown(cloneDay)}
            onMouseUp={() => handleMouseUp(cloneDay)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => handleMouseDown(cloneDay)}
            onTouchEnd={() => handleMouseUp(cloneDay)}
            onTouchCancel={handleMouseLeave}
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
                    {event.customLetter || event.userName.charAt(0).toUpperCase()}
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 glass-card">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}