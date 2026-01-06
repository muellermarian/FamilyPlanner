import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getTodosForFamily } from '../../lib/todos';
import { getNotesForFamily } from '../../lib/notes';

export function useDashboardData(familyId: string) {
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const todos = await getTodosForFamily(familyId, 'open');
        if (!mounted) return;
        setOpenCount(todos.length);

        try {
          const notes = await getNotesForFamily(familyId);
          if (!mounted) return;
          setNoteCount(notes.length);
        } catch (notesErr) {
          if (!mounted) return;
          setNoteCount(null);
        }
      } catch (err) {
        if (!mounted) return;
        setOpenCount(null);
        setNoteCount(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadFamilyName = async () => {
      try {
        const { data } = await supabase
          .from('families')
          .select('name')
          .eq('id', familyId)
          .maybeSingle();
        if (mounted) setFamilyName((data as any)?.name ?? null);
      } catch (err) {
        // Silent fail
      }
    };

    load();
    loadFamilyName();

    return () => {
      mounted = false;
    };
  }, [familyId]);

  return { openCount, noteCount, loading, familyName };
}
