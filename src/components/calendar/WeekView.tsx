import type { CalendarEvent, Todo, Contact, ShoppingItem } from '../../lib/types';
import {
  buildDayAgenda,
  getEventIcon,
  getEventColorClasses,
  formatTime,
  getISOWeek,
} from './calendarUtils';
import { useState } from 'react';
import DayDetail from './DayDetail';
import NavigationHeader from './NavigationHeader';

interface WeekViewProps {
  weekStart: Date;
  calendarEvents: CalendarEvent[];
  todos: Todo[];
  birthdays: Contact[];
  shoppingItems: ShoppingItem[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export default function WeekView({
  weekStart,
  calendarEvents,
  todos,
  birthdays,
  shoppingItems,
  onPreviousWeek,
  onNextWeek,
  onEditEvent,
}: WeekViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    return {
      date: dayDate,
      items: buildDayAgenda(dayDate, calendarEvents, todos, birthdays, shoppingItems),
    };
  });

  const todayStr = new Date().toDateString();

  const weekTitle = `KW ${getISOWeek(weekStart)} · ${weekStart.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })} – ${new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6
  ).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;

  return (
    <div className="space-y-3">
      <NavigationHeader title={weekTitle} onPrevious={onPreviousWeek} onNext={onNextWeek} />

      {weekDays.map(({ date, items }) => {
        const isToday = date.toDateString() === todayStr;
        const isSelected = selectedDay?.toDateString() === date.toDateString();

        return (
          <div key={date.toISOString()}>
            <button
              onClick={() => setSelectedDay(isSelected ? null : date)}
              className={`w-full text-left p-3 rounded border hover:border-blue-400 hover:bg-blue-50 transition ${
                isToday ? 'ring-2 ring-blue-500 bg-blue-50/80' : ''
              } ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm font-semibold">
                    {date.toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {items.length === 0 ? 'Keine Einträge' : `${items.length} Termin(e)/Aufgabe(n)`}
                  </div>
                </div>
                {isToday && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    Heute
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {items.slice(0, 4).map((item) => (
                  <span
                    key={`${item.type}-${item.id}`}
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      {
                        event: 'border-blue-300',
                        todo: 'border-green-300',
                        birthday: 'border-pink-300',
                        shopping: 'border-orange-300',
                      }[item.type] || 'border-gray-300'
                    } ${getEventColorClasses(item.type)}`}
                  >
                    {getEventIcon(item.type, item.data)} {item.title}
                    {item.time ? ` · ${formatTime(item.time)}` : ''}
                  </span>
                ))}
                {items.length > 4 && (
                  <span className="text-[11px] text-gray-600">+{items.length - 4} mehr</span>
                )}
              </div>
            </button>

            {/* Inline Details */}
            {isSelected && items.length > 0 && (
              <div className="mt-2 ml-4">
                <DayDetail
                  date={date}
                  items={items}
                  onClose={() => setSelectedDay(null)}
                  onEditEvent={onEditEvent}
                  compact={true}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
