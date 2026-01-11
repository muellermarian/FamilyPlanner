import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Todo } from '../../lib/types';
import TodoEditForm from './TodoEditForm';

// Props for the item component:
// - task: the entry to render
// - onToggle: toggles the entry's completion state
// - onDelete: deletes the entry by id
interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  users: { id: string; name: string }[];
  onEdit: () => void;
  // Optional: current user id (passed to edit form for comments)
  currentUserId?: string;
  // Optional: current profile id (preferred for FK relations)
  currentProfileId?: string;
  // Optional callback to refresh todos when edit form updates
  onRefresh?: () => void;
  // Comment meta
  commentCount?: number;
  comments?: { text?: string; user_id?: string; created_at?: string }[] | null;
}

// Make all props readonly to prevent accidental mutation
type ReadonlyTodoItemProps = Readonly<TodoItemProps>;

// Renders a single task entry with swipe-to-delete and inline controls.
// Features:
// - horizontal swipe to reveal a red delete background and trigger delete on full swipe left
// - checkbox to toggle completion
// - shows assignee, due date (colored when overdue), description, creator and done metadata
export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  users,
  onEdit,
  currentUserId,
  currentProfileId,
  onRefresh,
  commentCount,
  comments,
}: ReadonlyTodoItemProps) {
  // Horizontal translation applied while swiping (in pixels)
  const [swipeOffset, setSwipeOffset] = useState(0);
  // Whether a swipe is currently in progress (used to show/hide the delete background)
  const [isSwiping, setIsSwiping] = useState(false);
  // State to control the edit modal
  const [open, setOpen] = useState(false);

  // Handlers provided by react-swipeable to manage swipe interactions.
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only consider mostly-horizontal gestures to avoid interfering with vertical scroll
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setIsSwiping(true);
        // Limit swipe offset to the range [-80, 0] so it doesn't slide too far
        setSwipeOffset(Math.min(0, Math.max(-80, eventData.deltaX)));
      }
    },
    onSwipedLeft: (eventData) => {
      // If a left swipe is confirmed, reset visuals and perform delete
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setSwipeOffset(0);
        setIsSwiping(false);
        onDelete(todo.id);
      }
    },
    onSwipedRight: () => {
      // Cancel swipe: reset visual state
      setSwipeOffset(0);
      setIsSwiping(false);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 10,
  });

  return (
    <div {...handlers} className="relative overflow-hidden rounded">
      {/* Red delete background revealed while swiping left */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-opacity duration-200 ${
          isSwiping ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold">Löschen</span>
      </div>

      {/* Main card: slides left/right based on swipeOffset */}
      <div
        className="relative border rounded p-3 flex flex-col bg-white transition-transform duration-200 ease-out gap-2"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {/* Top row: Checkbox and task title */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={todo.isDone}
            onChange={() => onToggle(todo)}
            className="w-5 h-5 accent-blue-600 mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                todo.isDone ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {todo.task || 'Keine Aufgabe'}
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <button
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-700 font-bold text-sm"
            >
              📝
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="text-red-500 hover:text-red-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Person and description */}
        <div className="flex items-center gap-2 px-5 text-xs">
          <span>👤</span>
          <span className={todo.isDone ? 'line-through text-gray-400' : 'text-gray-600'}>
            {todo.assigned?.name || 'Nicht zugewiesen'}
          </span>
          {todo.description && (
            <>
              <span className="text-gray-400"></span>
              <span className={todo.isDone ? 'line-through text-gray-400' : 'text-gray-600'}>
                {todo.description}
              </span>
            </>
          )}
        </div>

        {/* Due date */}
        {todo.due_at && (
          <div className="px-5 flex items-center gap-2 text-xs">
            <span
              className={`font-medium ${
                new Date(todo.due_at) < new Date() && !todo.isDone
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}
            >
              📅 {new Date(todo.due_at).toLocaleDateString('de-DE')}
            </span>
          </div>
        )}

        {/* Comments section */}
        {typeof commentCount === 'number' &&
          commentCount > 0 &&
          comments &&
          comments.length > 0 && (
            <div className="px-5 space-y-2">
              <div className="text-xs font-medium text-gray-500">
                💬 {commentCount} Kommentar(e)
              </div>
              {comments.map((comment, idx) => (
                <div
                  key={
                    comment.user_id && comment.created_at
                      ? `${comment.user_id}-${comment.created_at}`
                      : idx
                  }
                  className="text-xs bg-gray-50 p-2 rounded border-l-2 border-gray-300"
                >
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <span>👤</span>
                    <span>
                      {users.find((u) => u.id === comment.user_id)?.name || comment.user_id}
                    </span>
                    {comment.created_at && (
                      <span className="text-gray-500 font-normal">
                        {new Date(comment.created_at).toLocaleDateString('de-DE')}{' '}
                        {new Date(comment.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {comment.text && comment.text.length > 200
                      ? `${comment.text.slice(0, 200)}…`
                      : comment.text}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Separator line */}
        <div className="border-t border-gray-200"></div>

        {/* Creator info */}
        <div className="px-5 text-xs text-gray-400 flex items-center gap-2">
          <span>👤</span>
          <span>
            {todo.creator?.name || todo.created_by_id}
            {todo.created_at && (
              <>
                {' '}
                {new Date(todo.created_at).toLocaleDateString('de-DE')}{' '}
                {new Date(todo.created_at).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
          </span>
          {todo.isDone && todo.done_by && (
            <>
              <span></span>
              <span className="text-green-600">✓ {todo.done_by.name}</span>
            </>
          )}
        </div>
      </div>

      {open && (
        <TodoEditForm
          todo={todo}
          users={users}
          onClose={() => setOpen(false)}
          onUpdate={onRefresh}
          currentUserId={currentUserId}
          currentProfileId={currentProfileId}
        />
      )}
    </div>
  );
}
