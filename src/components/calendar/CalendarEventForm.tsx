import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../lib/calendar';
import { formatTime, getNextFullHour } from './calendarUtils';
import type { CalendarEvent } from '../../lib/types';

interface CalendarEventFormProps {
  event?: CalendarEvent | null;
  initialDate?: Date | null;
  onSubmit: () => void;
  onCancel: () => void;
  onSuccess?: (message: string) => void;
}

export default function CalendarEventForm({
  event,
  initialDate,
  onSubmit,
  onCancel,
  onSuccess,
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
      setEventTime(formatTime(event.event_time) || '');
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
        onSuccess?.('Termin aktualisiert ✓');
      } else {
        await addCalendarEvent(familyId, title, eventDate, eventTime, description, userId);
        onSuccess?.('Termin hinzugefügt ✓');
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
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 text-2xl"
          type="button"
          aria-label="Zurück"
        >
          ←
        </button>
        <h3 className="text-lg font-bold flex-1">{event ? 'Termin bearbeiten' : 'Neuer Termin'}</h3>
      </div>

      {/* Form Content */}
      <form id="calendar-event-form" onSubmit={handleSubmit} className="px-4 space-y-4">
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
            onFocus={(e) => {
              if (!e.target.value) {
                setEventTime(getNextFullHour());
              }
            }}
            step="3600"
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
      </form>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex gap-2">
        {event && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Löschen
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded text-sm"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          form="calendar-event-form"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-sm"
        >
          {event ? 'Speichern' : 'Hinzufügen'}
        </button>
      </div>
    </div>
  );
}
