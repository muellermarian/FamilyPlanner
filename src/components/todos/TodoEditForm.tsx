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

type ReadonlyTodoEditFormProps = Readonly<TodoEditFormProps>;

export default function TodoEditForm({
  todo,
  users,
  onClose,
  onUpdate,
  currentUserId,
  currentProfileId,
}: ReadonlyTodoEditFormProps) {
  const [dueAt, setDueAt] = useState(todo.due_at ? todo.due_at.split('T')[0] : '');
  const [assignedTo, setAssignedTo] = useState<string | null>(todo.assigned_to_id ?? null);
  const [description, setDescription] = useState(todo.description ?? '');
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Load comments for this task entry
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

  // Save task entry
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

  // Add a comment to this task entry
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
    <div className="flex flex-col gap-3 p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="text-base font-semibold">Todo bearbeiten</h3>

      {/* Title */}
      <div>
        <label htmlFor="task-title" className="text-sm font-medium mb-1 block">
          Titel
        </label>
        <div id="task-title" className="border p-2 rounded bg-gray-50 text-gray-700">
          {todo.task}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-description" className="text-sm font-medium mb-1 block">
          Beschreibung
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung (optional)"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Due date */}
      <div>
        <label htmlFor="task-due" className="text-sm font-medium mb-1 block">
          Fällig am (optional)
        </label>
        <div className="flex gap-2">
          <input
            id="task-due"
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
      <div className="mt-2 pt-3 border-t">
        <h4 className="font-medium mb-2 text-sm">Kommentare</h4>

        {/* Add comment */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Neuer Kommentar"
            className="border p-2 rounded flex-1 text-sm"
          />
          <button
            onClick={addComment}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
          >
            +
          </button>
        </div>

        {/* Comments list */}
        <div className="flex flex-col gap-2 max-h-48 overflow-auto">
          {(() => {
            if (loadingComments) {
              return <div className="text-xs text-gray-500">Lade Kommentare…</div>;
            }
            if (comments.length > 0) {
              return comments.map((c) => (
                <div key={c.id} className="border rounded p-2 bg-gray-50 text-sm">
                  <div className="text-xs text-gray-600 mb-1">
                    {c.creator?.name || 'Unbekannt'} – {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm">{c.text}</div>
                </div>
              ));
            }
            return <div className="text-xs text-gray-500">Noch keine Kommentare</div>;
          })()}
        </div>
      </div>

      {/* Buttons save / cancel */}
      <div className="flex gap-2 mt-3 pt-3 border-t">
        <button
          onClick={save}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          Speichern
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
