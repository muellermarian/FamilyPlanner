// AgendaView component displays calendar items grouped by date.
import { useState } from 'react';
import type { CalendarEvent, Todo, Contact, AgendaItem } from '../../lib/types';
import { getEventIcon, getEventColorClasses, formatTime } from './calendarUtils';
import DayDetail from './DayDetail';

// Props for AgendaView:
// - items: array of agenda entries to display
// - onEditEvent: callback for editing calendar events
interface AgendaViewProps {
  items: AgendaItem[];
  onEditEvent: (event: CalendarEvent) => void;
}

type ReadonlyAgendaViewProps = Readonly<AgendaViewProps>;

// Make all props readonly to prevent mutation
export default function AgendaView({ items, onEditEvent }: ReadonlyAgendaViewProps) {
  // State for the currently selected date group
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Show message if there are no agenda items
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">📅</div>
        <p>Keine Termine vorhanden</p>
      </div>
    );
  }

  // Group agenda items by formatted date string
  const groupedItems: { [key: string]: AgendaItem[] } = {};

  items.forEach((item) => {
    const dateKey = item.date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    if (!groupedItems[dateKey]) {
      groupedItems[dateKey] = [];
    }
    groupedItems[dateKey].push(item);
  });

  // Render agenda items grouped by date
  return (
    <div className="space-y-6">
      {Object.keys(groupedItems).map((dateKey) => {
        const dayItems = groupedItems[dateKey];
        const itemDate = dayItems[0].date;
        const isToday = itemDate.toDateString() === new Date().toDateString();
        const isPast = itemDate < new Date() && !isToday;
        const isSelected = selectedDateKey === dateKey;

        // Render each date group with a header and details
        // Extract button color from nested ternary for SonarQube compliance
        let buttonColor = '';
        if (isToday) {
          buttonColor = 'bg-blue-500 text-white';
        } else if (isPast) {
          buttonColor = 'bg-gray-300 text-gray-600';
        } else {
          buttonColor = 'bg-gray-200 text-gray-800';
        }
        // Render each date group with a header and details
        return (
          <div key={dateKey}>
            {/* Date group header button */}
            <button
              onClick={() => setSelectedDateKey(isSelected ? null : dateKey)}
              className={`w-full sticky top-0 z-10 py-2 px-3 mb-2 rounded font-semibold text-left ${buttonColor} ${
                isSelected ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              {isToday ? `🔵 Heute · ${dateKey}` : dateKey}
            </button>

            {/* Show details for selected date */}
            {isSelected && (
              <div className="mb-4">
                <DayDetail
                  date={itemDate}
                  items={dayItems}
                  onClose={() => setSelectedDateKey(null)}
                  onEditEvent={onEditEvent}
                  compact={false}
                />
              </div>
            )}

            {/* Show summary cards for unselected date */}
            {!isSelected && (
              <div className="space-y-2">
                {dayItems.map((item) => {
                  // Get icon for the item type
                  const icon = getEventIcon(item.type, item.data);

                  // Map color classes to border classes for visual distinction
                  const borderColorMap: Record<string, string> = {
                    'bg-blue-100 text-blue-900': 'bg-blue-50 border-blue-200',
                    'bg-green-100 text-green-900': 'bg-green-50 border-green-200',
                    'bg-pink-100 text-pink-900': 'bg-pink-50 border-pink-200',
                    'bg-orange-100 text-orange-900': 'bg-orange-50 border-orange-200',
                  };
                  const colorClass = getEventColorClasses(item.type);
                  const bgColor = borderColorMap[colorClass] || 'bg-gray-50 border-gray-200';

                  // Calculate age text for birthdays
                  let ageText = '';
                  if (item.type === 'birthday') {
                    const contact = item.data as Contact;
                    if (contact.birthdate) {
                      const birthYear = new Date(contact.birthdate).getFullYear();
                      const currentYear = item.date.getFullYear();
                      const age = currentYear - birthYear;
                      ageText = `wird ${age} Jahre alt.`;
                    }
                  }

                  // Render summary card for each agenda item
                  return (
                    <button
                      type="button"
                      key={`${item.type}-${item.id}`}
                      onClick={() => setSelectedDateKey(dateKey)}
                      className={`border-l-4 ${bgColor} p-4 rounded-r shadow-sm cursor-pointer hover:shadow-md w-full text-left`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{item.title}</div>
                          {/* Show age for birthdays */}
                          {item.type === 'birthday' && ageText && (
                            <div className="text-sm text-gray-600 mt-1">🎈 {ageText}</div>
                          )}
                          {/* Show time if available */}
                          {item.time && (
                            <div className="text-sm text-gray-600 mt-1">
                              🕐 {formatTime(item.time)}
                            </div>
                          )}
                          {/* Show description if available */}
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          )}
                          {/* Show assigned user for tasks */}
                          {item.type === 'todo' && (item.data as Todo).assigned && (
                            <div className="text-sm text-gray-600 mt-1">
                              👤 {(item.data as Todo).assigned?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
