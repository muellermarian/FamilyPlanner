import type { Todo, Contact, AgendaItem } from '../../lib/types';

interface EventDetailModalProps {
  item: AgendaItem | null;
  onClose: () => void;
}

export default function EventDetailModal({ item, onClose }: EventDetailModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">
            {item.type === 'todo' ? ((item.data as any)?.isDone ? '✅' : '⬜') : '🎂'}
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{item.title}</h2>
            <div className="text-sm text-gray-500">
              {item.date.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {item.type === 'birthday' &&
          (() => {
            const contact = item.data as Contact;
            const birthYear = contact.birthdate ? new Date(contact.birthdate).getFullYear() : null;
            const age = birthYear ? item.date.getFullYear() - birthYear : null;
            return (
              <div className="space-y-2">
                {age && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">🎈 Alter:</span>
                    <span>wird {age} Jahre alt</span>
                  </div>
                )}
                {contact.birthdate && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📅 Geburtstag:</span>
                    <span>{new Date(contact.birthdate).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📞 Telefon:</span>
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">✉️ Email:</span>
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>
            );
          })()}

        {item.type === 'todo' &&
          (() => {
            const todo = item.data as Todo;
            return (
              <div className="space-y-2">
                {item.description && (
                  <div className="text-gray-700">
                    <span className="font-semibold block mb-1">Beschreibung:</span>
                    <p className="text-sm">{item.description}</p>
                  </div>
                )}
                {todo.assigned && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">👤 Zugewiesen:</span>
                    <span>{todo.assigned.name}</span>
                  </div>
                )}
                {todo.due_at && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">⏰ Fällig:</span>
                    <span>{new Date(todo.due_at).toLocaleString('de-DE')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">Status:</span>
                  <span className={todo.isDone ? 'text-green-600' : 'text-orange-600'}>
                    {todo.isDone ? '✓ Erledigt' : 'Offen'}
                  </span>
                </div>
              </div>
            );
          })()}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
