import { useEffect, useState } from 'react';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../lib/todos';
import type { Todo } from '../lib/types';

interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[]; // für Assigned To Dropdown
}

export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentProfileId || currentUserId);
  const [newComment, setNewComment] = useState('');

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

  const handleAdd = async () => {
    if (!newTask) return;
    const createdById = currentProfileId || currentUserId;
    const assigned = assignedTo || null; // null, wenn leer

    try {
      await addTodo(familyId, newTask, assigned, createdById, newComment);
      setNewTask('');
      setNewComment('');
      setAssignedTo(currentProfileId || currentUserId);
      await fetchTodos();
    } catch (err: any) {
      console.error('addTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await toggleTodo(id, !done);
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

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Family Todo</h2>

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
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
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

      {/* Todo-Liste */}
      <ul className="flex flex-col gap-3">
        {todos.map((todo) => (
          <li key={todo.id} className="border rounded p-3 flex justify-between items-start">
            <div className="flex flex-col flex-1 gap-1">
              {/* Assigned To*/}
              <div className="font-bold text-lg">{todo.assigned?.name || ''}</div>

              {/* Task & Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => handleToggle(todo.id, todo.isDone)}
                />
                <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
              </div>

              {/* Comment */}
              {todo.comment && <p className="text-gray-500 text-sm">{todo.comment}</p>}

              {/* Creator Info */}
              <div className="text-xs text-gray-400 mt-1">
                Erstellt von: {todo.creator?.name || todo.created_by_id}, am{' '}
                {new Date().toLocaleDateString()}
              </div>
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
