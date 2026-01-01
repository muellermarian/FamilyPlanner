import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Todo } from '../../lib/types';
import TodoEditForm from './TodoEditForm';

// Props for the TodoItem component:
// - todo: the todo item to render
// - onToggle: toggles the todo's completion state
// - onDelete: deletes the todo by id
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
  lastComment?: { text?: string; user_id?: string; created_at?: string } | null;
}

// Renders a single todo entry with swipe-to-delete and inline controls.
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
  lastComment,
}: TodoItemProps) {
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

      {/* Main todo card: slides left/right based on swipeOffset */}
      <div
        className="relative border rounded p-3 flex justify-between items-start bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="flex flex-col flex-1 gap-1">
          {/* Assignee name (if any) */}
          <div className="font-bold text-lg">{todo.assigned?.name || ''}</div>

          {/* Due date: colored red when past, blue otherwise */}
          {todo.due_at && (
            <p
              className={`text-sm font-semibold mt-1 ${
                new Date(todo.due_at) < new Date() ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              📅 Fällig am: {new Date(todo.due_at).toLocaleDateString()}
            </p>
          )}

          {/* Checkbox toggles completion; task title is struck through when done */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={todo.isDone}
              onChange={() => onToggle(todo)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
          </label>

          {/* Optional description */}
          {todo.description && <p className="text-gray-500 text-sm">{todo.description}</p>}

          {/* Comments summary: count and latest comment */}
          <div className="text-sm text-gray-500 mt-1">
            {typeof commentCount === 'number' && <span className="mr-3">💬 {commentCount}</span>}
            {lastComment && (
              <span>
                <strong>
                  {users.find((u) => u.id === lastComment.user_id)?.name || lastComment.user_id}:
                </strong>{' '}
                {lastComment.text && lastComment.text.length > 200
                  ? `${lastComment.text.slice(0, 200)}…`
                  : lastComment.text}
              </span>
            )}
          </div>

          {/* Creator and creation timestamp */}
          {todo.created_at && (
            <div className="text-xs text-gray-400 mt-1">
              * {todo.creator?.name || todo.created_by_id},{' '}
              {new Date(todo.created_at).toLocaleString()}
            </div>
          )}

          {/* If completed, show who marked it done and when */}
          {todo.isDone && todo.done_by && todo.done_at && (
            <div className="text-xs text-green-600 mt-1">
              ✓ {todo.done_by.name}, {new Date(todo.done_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* Explicit delete button: alternative to swipe-to-delete */}
        <button onClick={() => onDelete(todo.id)} className="text-red-500 font-bold ml-3">
          X
        </button>
        <button onClick={onEdit} className="text-blue-500 font-bold ml-3">
          📝
        </button>

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
    </div>
  );
}
