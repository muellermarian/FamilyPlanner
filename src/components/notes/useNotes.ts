import { useEffect, useState } from 'react';
import type { Note } from '../../lib/notes';
import { getNotesForFamily, addNote, deleteNote, updateNote } from '../../lib/notes';

const showError = (err: any) => alert(err?.message || String(err));

export function useNotes(familyId: string, currentProfileId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAdd = async (title: string, content: string) => {
    try {
      await addNote(familyId, title, content, currentProfileId);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Notiz wirklich löschen?')) return;
    try {
      await deleteNote(id);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
    }
  };

  const handleUpdate = async (note: Note) => {
    try {
      await updateNote(note.id, note.title, note.content);
      await fetchNotes();
    } catch (err: any) {
      showError(err);
    }
  };

  return { notes, loading, error, handleAdd, handleDelete, handleUpdate };
}
