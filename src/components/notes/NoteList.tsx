import { useEffect, useState } from 'react';
import type { Note } from '../../lib/notes';
import { getNotesForFamily, addNote, deleteNote, updateNote } from '../../lib/notes';
import NoteItem from './NoteItem';

/**
 * NoteList: simple list UI for notes within a family.
 *
 * - Styling and UX follow the TodoList patterns: a centered card, + button to add, and
 *   stacked list items with spacing.
 * - UI strings are in German per project convention; code comments remain in English.
 */
interface NoteListProps {
  familyId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

export default function NoteList({ familyId, currentProfileId, users }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotesForFamily(familyId);
      setNotes(data ?? []);
    } catch (err: any) {
      setError(err?.message || String(err));
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [familyId]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return alert('Please provide a title');
    try {
      await addNote(familyId, newTitle.trim(), newContent.trim(), currentProfileId);
      setNewTitle('');
      setNewContent('');
      setShowAdd(false);
      await fetchNotes();
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      await fetchNotes();
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  };

  const handleUpdate = async (note: Note) => {
    try {
      await updateNote(note.id, note.title, note.content);
      await fetchNotes();
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notizen</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
            aria-label="Neue Notiz"
          >
            +
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 flex flex-col gap-2">
          <input
            placeholder="Titel"
            className="border rounded px-2 py-1"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Inhalt"
            className="border rounded px-2 py-1 h-28"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleAdd}>
              Hinzufügen
            </button>
            <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setShowAdd(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="mb-2 text-sm text-gray-600">
        {loading ? '🔄 Lade Notizen…' : `${notes.length} Notizen`}
      </div>
      {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}

      <ul className="flex flex-col gap-3">
        {notes.map((n) => (
          <NoteItem
            key={n.id}
            note={n}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            users={users}
          />
        ))}
      </ul>
    </div>
  );
}
