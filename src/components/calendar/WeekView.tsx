// Import type definitions for calendar events, todos, contacts, and shopping items
import type { CalendarEvent, Todo, Contact, ShoppingItem } from '../../lib/types';
// Import utility functions for calendar operations
import {
  buildDayAgenda,
  getEventIcon,
  getEventColorClasses,
  formatTime,
  getISOWeek,
} from './calendarUtils';
// Import React hooks and child components
import { useState } from 'react';
import DayDetail from './DayDetail';
import NavigationHeader from './NavigationHeader';

// Props for the WeekView component
interface WeekViewProps {
  weekStart: Date; // The starting date of the week
  calendarEvents: CalendarEvent[]; // List of calendar events for the week
  todos: Todo[]; // List of todos for the week
  birthdays: Contact[]; // List of birthdays for the week
  shoppingItems: ShoppingItem[]; // List of shopping items for the week
  onPreviousWeek: () => void; // Callback to navigate to the previous week
  onNextWeek: () => void; // Callback to navigate to the next week
  onEditEvent: (event: CalendarEvent) => void; // Callback to edit a calendar event
}

type ReadonlyWeekViewProps = Readonly<WeekViewProps>;

export default function WeekView({
  weekStart,
  calendarEvents,
  todos,
  birthdays,
  shoppingItems,
  onPreviousWeek,
  onNextWeek,
  onEditEvent,
}: ReadonlyWeekViewProps) {
  // State to track the currently selected day for details view
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Build an array of days for the week, each with its agenda items
  const commentsByTodoId: Record<string, { text: string }[]> = {};
  if (Array.isArray(todos)) {
    todos.forEach((todo: any) => {
      if (Array.isArray(todo.comments)) {
        commentsByTodoId[todo.id] = todo.comments.map((c: any) => ({ text: c.text }));
      }
    });
  }
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    return {
      date: dayDate,
      items: buildDayAgenda(
        dayDate,
        calendarEvents,
        todos,
        birthdays,
        shoppingItems,
        commentsByTodoId
      ),
    };
  });

  // String representation of today's date for comparison
  const todayStr = new Date().toDateString();

  // Title for the week, showing week number and date range
  const weekTitle = `KW ${getISOWeek(weekStart)} · ${weekStart.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })} – ${new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6
  ).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;

  // Render the week view with navigation and daily agenda
  return (
    <div className="space-y-3">
      {/* Navigation header for switching weeks */}
      <NavigationHeader title={weekTitle} onPrevious={onPreviousWeek} onNext={onNextWeek} />

      {weekDays.map(({ date, items }) => {
        // Check if the current day is today
        const isToday = date.toDateString() === todayStr;
        // Check if the current day is selected for details
        const isSelected = selectedDay?.toDateString() === date.toDateString();

        return (
          <div key={date.toISOString()}>
            {/* Button to select/deselect the day and show agenda */}
            <button
              onClick={() => setSelectedDay(isSelected ? null : date)}
              className={`w-full text-left p-3 rounded border hover:border-blue-400 hover:bg-blue-50 transition ${
                isToday ? 'ring-2 ring-blue-500 bg-blue-50/80' : ''
              } ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  {/* Display the weekday and date */}
                  <div className="text-sm font-semibold">
                    {date.toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                  {/* Show number of items or 'No entries' if empty */}
                  <div className="text-xs text-gray-500">
                    {items.length === 0 ? 'Keine Einträge' : `${items.length} Termin(e)/Aufgabe(n)`}
                  </div>
                </div>
                {/* Highlight if today */}
                {isToday && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    Heute
                  </span>
                )}
              </div>

              {/* Show up to 4 agenda items as badges */}
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
                    {/* Icon and title for each item, with time if available */}
                    {getEventIcon(item.type, item.data)} {item.title}
                    {item.time ? ` · ${formatTime(item.time)}` : ''}
                  </span>
                ))}
                {/* Show count of additional items if more than 4 */}
                {items.length > 4 && (
                  <span className="text-[11px] text-gray-600">+{items.length - 4} mehr</span>
                )}
              </div>
            </button>

            {/* Inline details for the selected day */}
            {isSelected && items.length > 0 && (
              <div className="mt-2 ml-4">
                <DayDetail
                  date={date}
                  items={items}
                  onClose={() => setSelectedDay(null)}
                  onEditEvent={onEditEvent}
                  compact={false}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
