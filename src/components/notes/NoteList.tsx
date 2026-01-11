import { useState } from 'react';
import NoteItem from './NoteItem';
import NoteAddForm from './NoteAddForm';
import { useNotes } from './useNotes';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';

// NoteList component: displays a list of notes and allows adding new notes.
// Props:
// - familyId: ID of the current family/group
// - currentProfileId: ID of the current user profile
// - users: list of users in the family/group
interface NoteListProps {
  readonly familyId: string;
  readonly currentProfileId: string;
  readonly users: { id: string; name: string }[];
}

// Main component function
export default function NoteList({ familyId, currentProfileId, users }: NoteListProps) {
  // State to control visibility of add note form
  const [showAdd, setShowAdd] = useState(false);
  // Toast hook for showing notifications
  const { toast, showToast } = useToast();
  // Notes hook for fetching, adding, deleting, updating notes
  const { notes, loading, error, handleAdd, handleDelete, handleUpdate, refetch } = useNotes(
    familyId,
    currentProfileId
  );

  // Handler for adding a new note (calls hook, closes form, shows toast)
  const onAddNote = async (title: string, content: string) => {
    await handleAdd(title, content);
    setShowAdd(false);
    showToast('Notiz erfolgreich hinzugefügt ✓');
  };

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
        {/* Header with title and add button */}
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

        {/* Add note form, shown when showAdd is true */}
        {showAdd && <NoteAddForm onAdd={onAddNote} onCancel={() => setShowAdd(false)} />}

        {/* Status messages for loading, error, or empty list */}
        {loading && <div className="text-center text-gray-500 py-4">Lade Notizen...</div>}
        {error && <div className="text-center text-red-500 py-4">Fehler: {error}</div>}
        {!loading && notes.length === 0 && (
          <div className="text-center text-gray-500 py-4">Keine Notizen vorhanden.</div>
        )}

        {/* List of notes */}
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

        {/* Toast notification for feedback */}
        {toast && <Toast message={toast} />}
      </div>
    </PullToRefresh>
  );
}
