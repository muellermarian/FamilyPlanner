import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import CalendarEventForm from './CalendarEventForm.js';
import CalendarGrid from './CalendarGrid';
import AgendaView from './AgendaView';
import WeekView from './WeekView';
import DayDetail from './DayDetail';
import ViewModeSelector from './ViewModeSelector';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';
import { useCalendarData } from './useCalendarData';
import { useEventForm } from './useEventForm';
import {
  createAgendaItems,
  createCalendarDays,
  buildDayAgenda,
  getWeekStart,
} from './calendarUtils';

export default function CalendarView() {
  const { familyId } = useAuth();
  const { toast, showToast } = useToast();
  const { calendarEvents, todos, birthdays, shoppingItems, fetchData } = useCalendarData(
    familyId || ''
  );
  const { showEventForm, editEvent, selectedDate, openForNew, openForEdit, close } = useEventForm();

  const [viewMode, setViewMode] = useState<'upcoming' | 'calendar' | 'week'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const dayDetailRef = useRef<HTMLDivElement>(null);

  const selectedDayAgenda = selectedDay
    ? buildDayAgenda(selectedDay, calendarEvents, todos, birthdays, shoppingItems)
    : null;

  const handleSelectDay = (date: Date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDay(normalizedDate);
    setTimeout(
      () => dayDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      100
    );
  };

  useEffect(() => {
    setSelectedDay(null);
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const agendaItems = createAgendaItems(calendarEvents, todos, birthdays, shoppingItems, viewMode);
  const calendarDays = createCalendarDays(
    currentMonth,
    calendarEvents,
    todos,
    birthdays,
    shoppingItems
  );

  return (
    <PullToRefresh onRefresh={fetchData}>
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Kalender</h1>
          <button
            onClick={() => openForNew()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            + Termin
          </button>
        </div>

        {/* View Mode Selector */}
        <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />

        {/* Event Form */}
        {showEventForm && (
          <CalendarEventForm
            event={editEvent}
            initialDate={selectedDate}
            onSubmit={async () => {
              await fetchData();
              close();
            }}
            onCancel={close}
            onSuccess={showToast}
          />
        )}

        {/* Views - nur anzeigen wenn kein EventForm offen ist */}
        {!showEventForm &&
          (viewMode === 'calendar' ? (
            <>
              {/* Day Detail oberhalb */}
              {selectedDayAgenda && selectedDay && (
                <div ref={dayDetailRef}>
                  <DayDetail
                    date={selectedDay}
                    items={selectedDayAgenda}
                    onClose={() => setSelectedDay(null)}
                    onEditEvent={openForEdit}
                  />
                </div>
              )}

              <CalendarGrid
                days={calendarDays}
                currentMonth={currentMonth}
                onPreviousMonth={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }
                onNextMonth={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }
                onAddEvent={openForNew}
                onSelectDay={handleSelectDay}
              />
            </>
          ) : viewMode === 'week' ? (
            <WeekView
              weekStart={weekStart}
              calendarEvents={calendarEvents}
              todos={todos}
              birthdays={birthdays}
              shoppingItems={shoppingItems}
              onPreviousWeek={() => {
                const prev = new Date(weekStart);
                prev.setDate(prev.getDate() - 7);
                setWeekStart(prev);
              }}
              onNextWeek={() => {
                const next = new Date(weekStart);
                next.setDate(next.getDate() + 7);
                setWeekStart(next);
              }}
              onEditEvent={openForEdit}
            />
          ) : (
            <AgendaView items={agendaItems} onEditEvent={openForEdit} />
          ))}

        {toast && <Toast message={toast} />}
      </div>
    </PullToRefresh>
  );
}
