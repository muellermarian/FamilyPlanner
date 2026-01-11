// Custom React hook for managing notes (fetch, add, delete, update) for a family.
// Returns notes, loading/error state, and handler functions.
import { useEffect, useState } from 'react';
import type { Note } from '../../lib/notes';
import { getNotesForFamily, addNote, deleteNote, updateNote } from '../../lib/notes';

// Helper to show error messages as alerts
const showError = (err: any) => alert(err?.message || String(err));

// Main hook function
// familyId: ID of the current family/group
// currentProfileId: ID of the current user profile
export function useNotes(familyId: string, currentProfileId: string) {
  // State for notes array
  const [notes, setNotes] = useState<Note[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // Fetch notes from backend
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

  // Fetch notes when familyId changes
  useEffect(() => {
    fetchNotes();
  }, [familyId]);

  // Handler to add a new note
  const handleAdd = async (title: string, content: string) => {
    try {
      await addNote(familyId, title, content, currentProfileId);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
      throw err;
    }
  };

  // Handler to delete a note (with confirmation)
  const handleDelete = async (id: string) => {
    if (!confirm('Notiz wirklich löschen?')) return;
    try {
      await deleteNote(id);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
    }
  };

  // Handler to update a note
  const handleUpdate = async (note: Note) => {
    try {
      await updateNote(note.id, note.title, note.content);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
    }
  };

  // Return state and handlers for use in components
  return { notes, loading, error, handleAdd, handleDelete, handleUpdate, refetch: fetchNotes };
}
