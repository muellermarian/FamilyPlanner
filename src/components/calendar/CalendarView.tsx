import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact, AgendaItem } from '../../lib/types';
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
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'calendar' | 'week'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
  const [selectedDayAgenda, setSelectedDayAgenda] = useState<AgendaItem[] | null>(null);

  useEffect(() => {
    if (familyId) {
      fetchData();
    }
  }, [familyId]);

  const fetchData = async () => {
    try {
      const [events, todosData, birthdaysData] = await Promise.all([
        getCalendarEvents(familyId),
        getTodosForCalendar(familyId),
        getBirthdaysForCalendar(familyId),
      ]);
      setCalendarEvents(events);
      setTodos(todosData);
      setBirthdays(birthdaysData);
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

  const agendaItems = createAgendaItems(calendarEvents, todos, birthdays, viewMode);
  const calendarDays = createCalendarDays(currentMonth, calendarEvents, todos, birthdays);

  // Get week items (7 days from today)
  const getWeekItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return agendaItems.filter((item) => item.date >= today && item.date < weekEnd);
  };

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
              const dateStr = normalizedDate.toISOString().split('T')[0];

              // Get all items for this day from all sources
              const dayItems: AgendaItem[] = [];

              // Add calendar events
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

              // Add todos with due dates
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

              // Add birthdays
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

              setSelectedDayAgenda(dayItems);
            }}
          />

          {selectedDayAgenda && (
            <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDayAgenda[0]?.date.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDayAgenda(null)}
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
                        {item.type === 'birthday' ? '🎂' : item.type === 'todo' ? '✅' : '📅'}{' '}
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                      )}
                      {item.time && (
                        <div className="text-xs text-gray-500 mt-1">🕐 {item.time}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      ) : viewMode === 'week' ? (
        <AgendaView
          items={getWeekItems()}
          onEditEvent={handleEditEvent}
          onSelectItem={setSelectedItem}
        />
      ) : (
        <AgendaView
          items={agendaItems}
          onEditEvent={handleEditEvent}
          onSelectItem={setSelectedItem}
        />
      )}

      <EventDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
