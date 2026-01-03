import { useEffect, useState } from 'react';
import type { Todo, TodoFilterType } from '../../lib/types';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../../lib/todos';
import { TodoItem, TodoAddForm, TodoFilter, TodoEditForm } from './index';
import { supabase } from '../../lib/supabaseClient';

// Props for the TodoList component:
// - familyId: id of the family to load todos for
// - currentUserId/currentProfileId: ids used when creating or marking todos done
// - users: list of users available for assignment
interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

// TodoList: fetches and displays todos for a family with simple filtering and CRUD actions.
export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilterType>('open');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [minimalMode, setMinimalMode] = useState(false);
  const [commentMeta, setCommentMeta] = useState<
    Record<
      string,
      { count: number; comments?: { text: string; user_id?: string; created_at?: string }[] }
    >
  >({});

  // Fetch todos for the given family and filter; sets an empty array if no data returned.
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodosForFamily(familyId, filter);
      const todosLoaded = data ?? [];
      setTodos(todosLoaded);

      // Fetch comment counts and latest comment for the loaded todos
      if (todosLoaded.length > 0) {
        const todoIds = todosLoaded.map((t) => t.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('todo_comments')
          .select('todo_id, text, user_id, created_at')
          .in('todo_id', todoIds)
          .order('created_at', { ascending: false });

        if (commentsError) {
          setCommentMeta({});
        } else if (commentsData) {
          const map: Record<
            string,
            { count: number; comments?: { text: string; user_id?: string; created_at?: string }[] }
          > = {};
          for (const c of commentsData as any[]) {
            const id = c.todo_id as string;
            if (!map[id]) {
              map[id] = { count: 0, comments: [] };
            }
            map[id].count += 1;
            map[id].comments?.push({ text: c.text, user_id: c.user_id, created_at: c.created_at });
          }
          setCommentMeta(map);
        }
      } else {
        setCommentMeta({});
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setTodos([]);
      setCommentMeta({});
    } finally {
      setLoading(false);
    }
  };

  // Load todos when the familyId or the filter changes (initial load + family switch + filter changes)
  useEffect(() => {
    fetchTodos();
  }, [familyId, filter]);

  // Handler to add a new todo. Calls API then refreshes the list and hides the add form.
  const handleAdd = async (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => {
    try {
      await addTodo(
        familyId,
        task,
        assignedTo,
        currentProfileId || currentUserId,
        description,
        dueDate
      );
      await fetchTodos();
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Toggle completion state for a todo, passing the id of the user marking it done when appropriate.
  const handleToggle = async (todo: Todo) => {
    try {
      const doneById = !todo.isDone ? currentProfileId || currentUserId : null;
      await toggleTodo(todo.id, !todo.isDone, doneById);
      await fetchTodos();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Delete a todo and refresh the list
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      await fetchTodos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Apply the selected filter to the loaded todos (open, done, or all)
  const filteredTodos = todos.filter((t) => {
    if (filter === 'open') return !t.isDone;
    if (filter === 'done') return t.isDone;
    return true;
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Liste</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMinimalMode(!minimalMode)}
            className={`px-3 py-1 rounded font-medium text-sm ${
              minimalMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={minimalMode ? 'Detailansicht' : 'Minimalansicht'}
          >
            {minimalMode ? '☑' : '📋'}
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Add form: shown when the user clicks + */}
      {showAddForm && (
        <TodoAddForm
          currentProfileId={currentProfileId}
          currentUserId={currentUserId}
          users={users}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Minimal Mode */}
      {minimalMode ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {loading ? '🔄 Lade Todos…' : `${filteredTodos.filter((t) => !t.isDone).length} offen`}
          </div>
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => handleToggle(todo)}
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
                  onClick={() => setEditTodo(todo)}
                  className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm font-medium"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Filter control (open/all/done) */}
          <TodoFilter filter={filter} setFilter={setFilter} />

          {/* List of todos matching the selected filter */}
          <div className="mb-2 text-sm text-gray-600">
            {loading ? '🔄 Lade Todos…' : `${todos.length} Todos geladen`}
          </div>
          {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}
          <ul className="flex flex-col gap-3">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                users={users}
                onEdit={() => setEditTodo(todo)}
                currentUserId={currentUserId}
                currentProfileId={currentProfileId}
                onRefresh={fetchTodos}
                commentCount={commentMeta[todo.id]?.count ?? 0}
                comments={commentMeta[todo.id]?.comments ?? []}
              />
            ))}
          </ul>
        </>
      )}

      {editTodo && (
        <TodoEditForm
          todo={editTodo}
          users={users}
          onClose={() => setEditTodo(null)}
          onUpdate={fetchTodos}
          currentUserId={currentUserId}
          currentProfileId={currentProfileId}
        />
      )}
    </div>
  );
}
