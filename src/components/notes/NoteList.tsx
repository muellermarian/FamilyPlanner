import { useState } from 'react';
import NoteItem from './NoteItem';
import NoteAddForm from './NoteAddForm';
import { useNotes } from './useNotes';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

interface NoteListProps {
  familyId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

export default function NoteList({ familyId, currentProfileId, users }: NoteListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const { toast, showToast } = useToast();
  const { notes, loading, error, handleAdd, handleDelete, handleUpdate } = useNotes(
    familyId,
    currentProfileId
  );

  const onAddNote = async (title: string, content: string) => {
    await handleAdd(title, content);
    setShowAdd(false);
    showToast('Notiz erfolgreich hinzugefügt ✓');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      {/* Header */}
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

      {/* Add Form */}
      {showAdd && <NoteAddForm onAdd={onAddNote} onCancel={() => setShowAdd(false)} />}

      {/* Status */}
      {loading && <div className="text-center text-gray-500 py-4">Lade Notizen...</div>}
      {error && <div className="text-center text-red-500 py-4">Fehler: {error}</div>}
      {!loading && notes.length === 0 && (
        <div className="text-center text-gray-500 py-4">Keine Notizen vorhanden.</div>
      )}

      {/* Notes List */}
      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            users={users}
          />
        ))}
      </ul>

      {toast && <Toast message={toast} />}
    </div>
  );
}
