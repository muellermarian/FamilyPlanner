import type { CalendarEvent, Todo, Contact, AgendaItem } from '../../lib/types';
import { getEventIcon, getEventColorClasses } from './calendarUtils';

interface AgendaViewProps {
  items: AgendaItem[];
  onEditEvent: (event: CalendarEvent) => void;
  onSelectItem: (item: AgendaItem) => void;
}

export default function AgendaView({ items, onEditEvent, onSelectItem }: AgendaViewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">📅</div>
        <p>Keine Termine vorhanden</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {Object.keys(groupedItems).map((dateKey) => {
        const dayItems = groupedItems[dateKey];
        const itemDate = dayItems[0].date;
        const isToday = itemDate.toDateString() === new Date().toDateString();
        const isPast = itemDate < new Date() && !isToday;

        return (
          <div key={dateKey}>
            <div
              className={`sticky top-0 z-10 py-2 px-3 mb-2 rounded font-semibold ${
                isToday
                  ? 'bg-blue-500 text-white'
                  : isPast
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {isToday ? '🔵 Heute' : dateKey}
            </div>

            <div className="space-y-2">
              {dayItems.map((item) => {
                const icon = getEventIcon(item.type, item.data);

                // Map color classes to border classes
                const borderColorMap: Record<string, string> = {
                  'bg-blue-100 text-blue-900': 'bg-blue-50 border-blue-200',
                  'bg-green-100 text-green-900': 'bg-green-50 border-green-200',
                  'bg-pink-100 text-pink-900': 'bg-pink-50 border-pink-200',
                  'bg-orange-100 text-orange-900': 'bg-orange-50 border-orange-200',
                };
                const colorClass = getEventColorClasses(item.type);
                const bgColor = borderColorMap[colorClass] || 'bg-gray-50 border-gray-200';

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

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.type === 'event') {
                        onEditEvent(item.data as CalendarEvent);
                      } else {
                        onSelectItem(item);
                      }
                    }}
                    className={`border-l-4 ${bgColor} p-4 rounded-r shadow-sm cursor-pointer hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{item.title}</div>
                        {item.type === 'birthday' && ageText && (
                          <div className="text-sm text-gray-600 mt-1">🎈 {ageText}</div>
                        )}
                        {item.time && (
                          <div className="text-sm text-gray-600 mt-1">🕐 {item.time}</div>
                        )}
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                        )}
                        {item.type === 'todo' && (item.data as Todo).assigned && (
                          <div className="text-sm text-gray-600 mt-1">
                            👤 {(item.data as Todo).assigned?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
