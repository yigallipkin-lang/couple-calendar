'use client';

import { useState } from 'react';
import { getCalendarDays, formatMonthYear, getNextMonth, getPreviousMonth, isSameDay } from '@couple-calendar/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '@couple-calendar/shared';

interface CalendarProps {
  events: Event[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: Event) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onSelectDate, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = getCalendarDays(currentDate);
  const monthYear = formatMonthYear(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const getEventsForDay = (day: number | null): Event[] => {
    if (day === null) return [];
    const targetDate = new Date(year, month, day);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      if (!event.startTime && !event.allDay) return false;
      if (event.allDay) {
        const eventDate = new Date(event.startTime || new Date());
        return isSameDay(eventDate, targetDate);
      }
      const eventStart = new Date(event.startTime!);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const isCurrentMonth = (day: number | null): boolean => {
    if (day === null) return false;
    // First day of month determines if we're in current month
    const firstDay = new Date(year, month, 1).getDay();
    const position = calendarDays.indexOf(day);
    return position >= firstDay && position < firstDay + new Date(year, month + 1, 0).getDate();
  };

  return (
    <div className="w-full bg-slate-900/50 rounded-lg border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-50">{monthYear}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isInCurrentMonth = isCurrentMonth(day);
          const isToday = day !== null && isSameDay(new Date(year, month, day), new Date());

          return (
            <div
              key={`${day}-${index}`}
              onClick={() => day !== null && onSelectDate(new Date(year, month, day))}
              className={`
                aspect-square p-2 rounded-lg border transition-all cursor-pointer
                ${day === null
                  ? 'bg-slate-950/50 border-transparent'
                  : isToday
                    ? 'bg-sky-900/30 border-sky-500 shadow-lg shadow-sky-500/20'
                    : isInCurrentMonth
                      ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-950/30 border-slate-800 text-slate-600'
                }
              `}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: event.color + '20',
                          color: event.color,
                          border: `1px solid ${event.color}40`,
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-400 px-2">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
