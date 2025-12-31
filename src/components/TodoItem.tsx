import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Todo } from '../lib/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [isSwiping, setIsSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: () => setIsSwiping(true),
    onSwipedLeft: () => {
      setIsSwiping(false);
      onDelete(todo.id);
    },
    onSwipedRight: () => setIsSwiping(false),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="relative overflow-hidden rounded">
      {/* Roter Hintergrund */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-all duration-200 ${
          isSwiping ? 'opacity-100 translate-x-0' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold transform transition-transform duration-200 scale-100">
          Löschen
        </span>
      </div>

      {/* Todo-Inhalt */}
      <div
        className={`relative border rounded p-3 flex justify-between items-start bg-white transition-transform duration-200 ${
          isSwiping ? '-translate-x-6' : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 gap-1">
          <div className="font-bold text-lg">{todo.assigned?.name || ''}</div>
          {todo.due_at && (
            <p
              className={`text-sm font-semibold mt-1 ${
                new Date(todo.due_at) < new Date() ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              📅 Fällig am: {new Date(todo.due_at).toLocaleDateString()}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={todo.isDone} onChange={() => onToggle(todo)} />
            <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
          </div>
          {todo.comment && <p className="text-gray-500 text-sm">{todo.comment}</p>}
          {todo.created_at && (
            <div className="text-xs text-gray-400 mt-1">
              * {todo.creator?.name || todo.created_by_id},{' '}
              {new Date(todo.created_at).toLocaleString()}
            </div>
          )}
          {todo.isDone && todo.done_by && todo.done_at && (
            <div className="text-xs text-green-600 mt-1">
              ✓ {todo.done_by.name}, {new Date(todo.done_at).toLocaleString()}
            </div>
          )}
        </div>

        <button onClick={() => onDelete(todo.id)} className="text-red-500 font-bold ml-3">
          X
        </button>
      </div>
    </div>
  );
}
