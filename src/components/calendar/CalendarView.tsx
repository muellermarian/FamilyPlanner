import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
  getShoppingItemsForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact, ShoppingItem, AgendaItem } from '../../lib/types';
import CalendarEventForm from './CalendarEventForm.js';
import CalendarGrid from './CalendarGrid';
import AgendaView from './AgendaView';
import EventDetailModal from './EventDetailModal';
import { createAgendaItems, createCalendarDays } from './calendarUtils';
export default function CalendarView() {
  const { familyId: userFamilyId } = useAuth();
  const familyId = userFamilyId || '';

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [birthdays, setBirthdays] = useState<Contact[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'calendar' | 'week'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
  const [selectedDayAgenda, setSelectedDayAgenda] = useState<AgendaItem[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const weekday = today.getDay();
    const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + diffToMonday);
    return start;
  });

  useEffect(() => {
    if (familyId) {
      fetchData();
    }
  }, [familyId]);

  const fetchData = async () => {
    try {
      const [events, todosData, birthdaysData, shoppingData] = await Promise.all([
        getCalendarEvents(familyId),
        getTodosForCalendar(familyId),
        getBirthdaysForCalendar(familyId),
        getShoppingItemsForCalendar(familyId),
      ]);
      setCalendarEvents(events);
      setTodos(todosData);
      setBirthdays(birthdaysData);
      setShoppingItems(shoppingData);
    } catch (err) {
      // Silent fail on calendar data fetch
    }
  };

  const handleAddEvent = () => {
    const today = new Date();
    const normalizedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    setSelectedDate(normalizedDate);
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleAddEventForDate = (date: Date) => {
    // Normalize date to midnight in local timezone
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(normalizedDate);
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  // Clear day selection when switching view modes
  useEffect(() => {
    setSelectedDayAgenda(null);
    setSelectedDay(null);
  }, [viewMode]);

  const agendaItems = createAgendaItems(calendarEvents, todos, birthdays, shoppingItems, viewMode);
  const calendarDays = createCalendarDays(
    currentMonth,
    calendarEvents,
    todos,
    birthdays,
    shoppingItems
  );

  // Build all agenda items for a specific day (events, todos, birthdays)
  const buildDayAgenda = (date: Date): AgendaItem[] => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const day = String(normalizedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayItems: AgendaItem[] = [];

    calendarEvents.forEach((event) => {
      if (event.event_date === dateStr) {
        dayItems.push({
          type: 'event',
          title: event.title,
          id: event.id,
          date: normalizedDate,
          time: event.event_time,
          description: event.description,
          data: event,
        });
      }
    });

    todos.forEach((todo) => {
      if (todo.due_at && todo.due_at.startsWith(dateStr)) {
        dayItems.push({
          type: 'todo',
          title: todo.task,
          id: todo.id,
          date: normalizedDate,
          description: todo.description,
          data: todo,
        });
      }
    });

    birthdays.forEach((contact) => {
      if (contact.birthdate) {
        const bdayDate = new Date(contact.birthdate);
        if (
          bdayDate.getMonth() === normalizedDate.getMonth() &&
          bdayDate.getDate() === normalizedDate.getDate()
        ) {
          dayItems.push({
            type: 'birthday',
            title: `${contact.first_name} ${contact.last_name}`,
            id: contact.id,
            date: normalizedDate,
            data: contact,
          });
        }
      }
    });

    shoppingItems.forEach((item) => {
      if (item.deal_date === dateStr) {
        const title = item.store ? `🛒 ${item.name} (${item.store})` : `🛒 ${item.name}`;
        dayItems.push({
          type: 'shopping',
          title,
          id: item.id,
          date: normalizedDate,
          description: `${item.quantity} ${item.unit}`,
          data: item,
        });
      }
    });

    return dayItems;
  };

  // Get all days for the selected week (Mon-Sun) with their agenda items
  const getCurrentWeek = () => {
    const days: { date: Date; items: AgendaItem[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      days.push({ date: dayDate, items: buildDayAgenda(dayDate) });
    }
    return days;
  };

  // ISO week number (ISO-8601, Monday as first day)
  const getISOWeek = (date: Date) => {
    const temp = new Date(date);
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      )
    );
  };

  const todayStr = new Date().toDateString();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kalender</h1>
        <button
          onClick={handleAddEvent}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          + Termin
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Anstehend
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Woche
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'calendar'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kalender
        </button>
      </div>

      {showEventForm && (
        <CalendarEventForm
          event={editEvent}
          initialDate={selectedDate}
          onSubmit={async () => {
            await fetchData();
            setShowEventForm(false);
            setEditEvent(null);
            setSelectedDate(null);
          }}
          onCancel={() => {
            setShowEventForm(false);
            setEditEvent(null);
            setSelectedDate(null);
          }}
        />
      )}

      {viewMode === 'calendar' ? (
        <>
          <CalendarGrid
            days={calendarDays}
            currentMonth={currentMonth}
            onPreviousMonth={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            onNextMonth={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            onAddEvent={handleAddEventForDate}
            onSelectDay={(date) => {
              // Normalize date to midnight in local timezone
              const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              setSelectedDay(normalizedDate);
              setSelectedDayAgenda(buildDayAgenda(normalizedDate));
            }}
          />
        </>
      ) : viewMode === 'week' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                const prev = new Date(weekStart);
                prev.setDate(prev.getDate() - 7);
                setWeekStart(prev);
              }}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
            >
              ←
            </button>
            <div className="text-sm font-semibold text-gray-700">
              KW {getISOWeek(weekStart)} ·{' '}
              {weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              {' – '}
              {new Date(
                weekStart.getFullYear(),
                weekStart.getMonth(),
                weekStart.getDate() + 6
              ).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </div>
            <button
              onClick={() => {
                const next = new Date(weekStart);
                next.setDate(next.getDate() + 7);
                setWeekStart(next);
              }}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
            >
              →
            </button>
          </div>

          {getCurrentWeek().map(({ date, items }) => {
            const isToday = date.toDateString() === todayStr;
            return (
              <button
                key={date.toISOString()}
                onClick={() => {
                  setSelectedDay(date);
                  setSelectedDayAgenda(items);
                }}
                className={`w-full text-left p-3 rounded border hover:border-blue-400 hover:bg-blue-50 transition ${
                  isToday ? 'ring-2 ring-blue-500 bg-blue-50/80' : ''
                }`}
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
                      {items.length === 0
                        ? 'Keine Einträge'
                        : `${items.length} Termin(e)/Aufgabe(n)`}
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
                          event: 'bg-blue-100 border-blue-300 text-blue-900',
                          todo: 'bg-green-100 border-green-300 text-green-900',
                          birthday: 'bg-pink-100 border-pink-300 text-pink-900',
                          shopping: 'bg-orange-100 border-orange-300 text-orange-900',
                        }[item.type]
                      }`}
                    >
                      {item.type === 'birthday'
                        ? '🎂'
                        : item.type === 'shopping'
                        ? '🛒'
                        : item.type === 'todo'
                        ? (item.data as any)?.isDone
                          ? '✅'
                          : '⬜'
                        : '📅'}{' '}
                      {item.title}
                      {item.time ? ` · ${item.time}` : ''}
                    </span>
                  ))}
                  {items.length > 4 && (
                    <span className="text-[11px] text-gray-600">+{items.length - 4} mehr</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <AgendaView
          items={agendaItems}
          onEditEvent={handleEditEvent}
          onSelectItem={setSelectedItem}
        />
      )}

      {selectedDayAgenda && selectedDay && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {selectedDay.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <button
              onClick={() => {
                setSelectedDayAgenda(null);
                setSelectedDay(null);
              }}
              className="text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
          </div>
          {selectedDayAgenda.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Termine für diesen Tag</p>
          ) : (
            <ul className="space-y-2">
              {selectedDayAgenda.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className={`p-3 rounded border-l-4 ${
                    item.type === 'event'
                      ? 'bg-blue-50 border-l-blue-500'
                      : item.type === 'todo'
                      ? 'bg-green-50 border-l-green-500'
                      : 'bg-pink-50 border-l-pink-500'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {item.type === 'birthday'
                      ? '🎂'
                      : item.type === 'todo'
                      ? (item.data as any)?.isDone
                        ? '✅'
                        : '⬜'
                      : '📅'}{' '}
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                  )}
                  {item.time && <div className="text-xs text-gray-500 mt-1">🕐 {item.time}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <EventDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
