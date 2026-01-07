import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Todo, Todo_Comment } from '../../lib/types';
import AssignedSelect from '../shared/AssignedSelect';

interface CommentWithUser extends Todo_Comment {
  creator?: { id: string; name: string } | null;
}

interface TodoEditFormProps {
  todo: Todo;
  users: { id: string; name: string }[];
  onClose: () => void;
  // Optional callback so parent can refresh after save/comment
  onUpdate?: () => void;
  // Optional: id of the current user (used when creating comments)
  currentUserId?: string;
  // Optional: id of the current profile (preferred for FK relations)
  currentProfileId?: string;
}

export default function TodoEditForm({
  todo,
  users,
  onClose,
  onUpdate,
  currentUserId,
  currentProfileId,
}: TodoEditFormProps) {
  const [dueAt, setDueAt] = useState(todo.due_at ? todo.due_at.split('T')[0] : '');
  const [assignedTo, setAssignedTo] = useState<string | null>(todo.assigned_to_id ?? null);
  const [description, setDescription] = useState(todo.description ?? '');
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Load comments for this todo
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('todo_comments')
        .select(
          `
      id,
      text,
      todo_id,
      user_id,
      created_at
    `
        )
        .eq('todo_id', todo.id)
        .order('created_at', { ascending: false });

      if (error) {
        return;
      }

      if (data) {
        // Normalize creator relation which can be returned as an array or object,
        // or missing (use user_id to resolve from provided users list).
        const normalized = (data as any[]).map((c) => {
          let creator = Array.isArray(c.creator) ? c.creator[0] ?? null : c.creator ?? null;
          if (!creator && c.user_id) {
            const u = users.find((x) => x.id === c.user_id) ?? null;
            creator = u ? { id: u.id, name: u.name } : null;
          }
          return { ...c, creator };
        });
        setComments(normalized as CommentWithUser[]);
      }
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [todo.id]);

  // Save todo
  const save = async () => {
    const { error } = await supabase
      .from('todos')
      .update({
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        assigned_to_id: assignedTo,
        description,
      })
      .eq('id', todo.id);

    if (!error) {
      onUpdate?.();
      onClose();
    }
  };

  // Add a comment to this todo
  const addComment = async () => {
    if (!newComment.trim()) return;

    const insertData: any = { todo_id: todo.id, text: newComment.trim() };
    const commenterId = currentProfileId ?? currentUserId;
    if (commenterId) insertData.user_id = commenterId;

    const { data, error } = await supabase
      .from('todo_comments')
      .insert([insertData])
      .select(
        `
      id,
      text,
      todo_id,
      user_id,
      created_at
    `
      )
      .single();

    if (error) {
      return;
    }

    if (data) {
      const c = data as any;
      let creator = Array.isArray(c.creator) ? c.creator[0] ?? null : c.creator ?? null;
      if (!creator && c.user_id) {
        const u = users.find((x) => x.id === c.user_id) ?? null;
        creator = u ? { id: u.id, name: u.name } : null;
      }
      const norm = { ...c, creator } as CommentWithUser;
      // Prepend new comment so the newest comments appear first
      setComments((prev) => [norm, ...prev]);
      setNewComment('');
      onUpdate?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start pt-10 overflow-auto">
      <div className="flex flex-col gap-2 mb-6 border rounded p-4 bg-gray-50 w-full max-w-md mx-4 sm:mx-auto">
        <h2 className="text-lg font-bold mb-2">Todo bearbeiten</h2>

        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-1 block">Titel</label>
          <input
            type="text"
            value={todo.task}
            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1 block">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Due date */}
        <div>
          <label className="text-sm font-medium mb-1 block">Fällig am (optional)</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            {dueAt && (
              <button
                type="button"
                onClick={() => setDueAt('')}
                className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
                title="Löschen"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Assigned to */}
        <AssignedSelect
          label="Zugewiesen an (optional)"
          value={assignedTo}
          users={users}
          onChange={setAssignedTo}
        />

        {/* Comments section */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Kommentare</h3>

          {/* Add comment */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Neuer Kommentar"
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={addComment}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Hinzufügen
            </button>
          </div>

          {/* Comments list */}
          <div className="flex flex-col gap-2 max-h-64 overflow-auto">
            {loadingComments ? (
              <div className="text-sm text-gray-500">Lade Kommentare…</div>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="border rounded p-2 bg-white">
                  <div className="text-sm text-gray-600">
                    {c.creator?.name || 'Unbekannt'} – {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div>{c.text}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Noch keine Kommentare</div>
            )}
          </div>
        </div>
        {/* Buttons speichern / abbrechen */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={save}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Speichern
          </button>
          <button onClick={onClose} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
