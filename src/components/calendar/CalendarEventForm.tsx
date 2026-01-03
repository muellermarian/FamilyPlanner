import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../lib/calendar';
import type { CalendarEvent } from '../../lib/types';

interface CalendarEventFormProps {
  event?: CalendarEvent | null;
  initialDate?: Date | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function CalendarEventForm({
  event,
  initialDate,
  onSubmit,
  onCancel,
}: CalendarEventFormProps) {
  const { user, familyId: userFamilyId } = useAuth();
  const familyId = userFamilyId || '';
  const userId = user?.id || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventDate(event.event_date);
      setEventTime(event.event_time || '');
    } else if (initialDate) {
      // Normalize the date to local timezone (midnight)
      const normalizedDate = new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate()
      );
      const year = normalizedDate.getFullYear();
      const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
      const day = String(normalizedDate.getDate()).padStart(2, '0');
      setEventDate(`${year}-${month}-${day}`);
    }
  }, [event, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    try {
      if (event) {
        await updateCalendarEvent(event.id, title, eventDate, eventTime, description);
      } else {
        await addCalendarEvent(familyId, title, eventDate, eventTime, description, userId);
      }
      onSubmit();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Termin wirklich löschen?')) return;

    try {
      await deleteCalendarEvent(event.id);
      onSubmit();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{event ? 'Termin bearbeiten' : 'Neuer Termin'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Uhrzeit</label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              {event ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Abbrechen
            </button>
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              >
                🗑️
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
