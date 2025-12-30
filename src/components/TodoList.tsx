import { useEffect, useState } from 'react';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../lib/todos';
import type { Todo } from '../lib/types';

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
      await fetchTodos();
    } catch (err: any) {
      console.error('addTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
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
      <h2 className="text-2xl font-bold mb-4">Todo Liste</h2>

      {/* Neue Aufgabe */}
      <div className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Neue Aufgabe"
          className="border p-2 rounded"
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Kommentar"
          className="border p-2 rounded"
        />
        <label className="text-gray-500 text-sm mb-1">Fällig am: (optional)</label>
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="border p-2 rounded"
        />
        <label className="text-gray-500 text-sm mb-1">Zugewiesen an: (optional)</label>
        <select
          value={assignedTo || ''}
          onChange={(e) => setAssignedTo(e.target.value || null)}
          className="border p-2 rounded"
        >
          <option value="">Ohne Zuweisung</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Hinzufügen
        </button>
      </div>

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
          <li key={todo.id} className="border rounded p-3 flex justify-between items-start">
            <div className="flex flex-col flex-1 gap-1">
              {/* Assigned To */}
              <div className="font-bold text-lg">{todo.assigned?.name || ''}</div>

              {/* Due Date */}
              {todo.due_at && (
                <p className="text-gray-500 text-sm">
                  Fällig am: {new Date(todo.due_at).toLocaleDateString()}
                </p>
              )}

              {/* Task & Checkbox */}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={todo.isDone} onChange={() => handleToggle(todo)} />
                <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
              </div>

              {/* Comment */}
              {todo.comment && <p className="text-gray-500 text-sm">{todo.comment}</p>}

              {/* Created Info */}
              {todo.created_at && (
                <div className="text-xs text-gray-400 mt-1">
                  Erstellt: {todo.creator?.name || todo.created_by_id}, am{' '}
                  {new Date(todo.created_at).toLocaleString()}
                </div>
              )}

              {/* Done Info */}
              {todo.isDone && todo.done_by && todo.done_at && (
                <div className="text-xs text-green-600 mt-1">
                  Abgehakt: {todo.done_by.name}, {new Date(todo.done_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button onClick={() => handleDelete(todo.id)} className="text-red-500 font-bold ml-3">
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
