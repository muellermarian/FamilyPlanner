import type { Todo } from '../../lib/types';

interface MinimalTodoViewProps {
  todos: Todo[];
  loading: boolean;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
}

type ReadonlyMinimalTodoViewProps = Readonly<MinimalTodoViewProps>;

export default function MinimalTodoView({
  todos,
  loading,
  onToggle,
  onEdit,
}: ReadonlyMinimalTodoViewProps) {
  const openCount = todos.filter((t) => !t.isDone).length;

  return (
    <>
      <div className="mb-4 text-sm text-gray-600">
        {loading ? '🔄 Lade Todos…' : `${openCount} offen`}
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.isDone}
              onChange={() => onToggle(todo)}
              className="w-5 h-5 cursor-pointer"
            />
            <span
              className={`flex-1 text-sm ${
                todo.isDone ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {todo.task}
            </span>
            <button
              onClick={() => onEdit(todo)}
              className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm font-medium"
            >
              ✏️
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
