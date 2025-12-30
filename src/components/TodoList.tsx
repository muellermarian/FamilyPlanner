import { useEffect, useState } from 'react';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../lib/todos';
import type { Todo } from '../lib/types';
import TodoItem from './TodoItem';

interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[]; // für Assigned To Dropdown
}

type FilterType = 'open' | 'all' | 'done';

export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | null>(currentProfileId || currentUserId);
  const [newComment, setNewComment] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<FilterType>('open');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  const fetchTodos = async () => {
    const data = await getTodosForFamily(familyId);
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Neue Aufgabe hinzufügen
  const handleAdd = async () => {
    if (!newTask) return;
    const createdById = currentProfileId || currentUserId;
    const assigned = assignedTo || null;

    try {
      await addTodo(familyId, newTask, assigned, createdById, newComment, newDueDate || null);
      setNewTask('');
      setNewComment('');
      setAssignedTo(currentProfileId || currentUserId);
      setNewDueDate('');
      setShowAddForm(false);
      await fetchTodos();
    } catch (err: any) {
      console.error('addTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleCancelAdd = () => {
    setNewTask('');
    setNewComment('');
    setAssignedTo(currentProfileId || currentUserId);
    setNewDueDate('');
    setShowAddForm(false);
  };

  // Toggle Todo erledigt / nicht erledigt
  const handleToggle = async (todo: Todo) => {
    try {
      const doneById = !todo.isDone ? currentProfileId || currentUserId : null;
      await toggleTodo(todo.id, !todo.isDone, doneById);
      await fetchTodos();
    } catch (err: any) {
      console.error('toggleTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      await fetchTodos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'open') return !t.isDone;
    if (filter === 'done') return t.isDone;
    return true;
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Liste</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
          >
            +
          </button>
        )}
      </div>

      {/* Add-Form nur anzeigen, wenn showAddForm true ist */}
      {showAddForm && (
        <div className="flex flex-col gap-2 mb-6 border rounded p-3 bg-gray-50">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Neue Aufgabe"
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Kommentar"
            className="border p-2 rounded"
          />
          <select
            value={assignedTo || ''}
            onChange={(e) => setAssignedTo(e.target.value || currentProfileId || currentUserId)}
            className="border p-2 rounded"
          >
            <option value="">Ohne Zuweisung</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Hinzufügen
            </button>
            <button
              onClick={handleCancelAdd}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('open')}
          className={`px-3 py-1 rounded ${
            filter === 'open' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Offene Todos
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-3 py-1 rounded ${
            filter === 'done' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Erledigt
        </button>
      </div>

      {/* Todo-Liste */}
      <ul className="flex flex-col gap-3">
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
