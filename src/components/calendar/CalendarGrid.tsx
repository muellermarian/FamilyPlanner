import type { CalendarEvent, CalendarDay } from '../../lib/types';

interface CalendarGridProps {
  days: CalendarDay[];
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onSelectItem: (item: any) => void;
}

export default function CalendarGrid({
  days,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onAddEvent,
  onEditEvent,
  onSelectItem,
}: CalendarGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPreviousMonth}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={onNextMonth}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="text-center font-semibold text-xs p-1 bg-gray-100 rounded">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          return (
            <div
              key={idx}
              className={`min-h-[80px] border rounded p-1 ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-xs font-semibold ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${
                    isToday
                      ? 'bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'
                      : ''
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {day.isCurrentMonth && (
                  <button
                    onClick={() => onAddEvent(day.date)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                  >
                    +
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {day.events.map((event) => (
                  <div
                    key={`${event.type}-${event.id}`}
                    className={`text-[10px] p-0.5 rounded cursor-pointer ${
                      event.type === 'event'
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                        : event.type === 'todo'
                        ? 'bg-green-100 hover:bg-green-200 text-green-900'
                        : 'bg-pink-100 hover:bg-pink-200 text-pink-900'
                    }`}
                    onClick={() => {
                      if (event.type === 'event') {
                        onEditEvent(event.data as CalendarEvent);
                      } else {
                        onSelectItem(event);
                      }
                    }}
                  >
                    <div className="truncate">
                      {event.type === 'birthday' ? '🎂' : event.type === 'todo' ? '✅' : '📅'}{' '}
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="text-[9px] opacity-75 truncate">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
