import { useEffect, useState } from 'react';
import type { Todo, TodoFilterType } from '../../lib/types';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../../lib/todos';
import { TodoItem, TodoAddForm, TodoFilter } from './index';

interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilterType>('open');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTodos = async () => {
    const data = await getTodosForFamily(familyId, filter);
    setTodos(data ?? []);
  };

  useEffect(() => {
    fetchTodos();
  }, [familyId]);

  const handleAdd = async (
    task: string,
    assignedTo: string | null,
    comment: string,
    dueDate: string | null
  ) => {
    try {
      await addTodo(
        familyId,
        task,
        assignedTo,
        currentProfileId || currentUserId,
        comment,
        dueDate
      );
      await fetchTodos();
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const doneById = !todo.isDone ? currentProfileId || currentUserId : null;
      await toggleTodo(todo.id, !todo.isDone, doneById);
      await fetchTodos();
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      await fetchTodos();
    } catch (err: any) {
      console.error(err);
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
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
          >
            +
          </button>
        )}
      </div>

      {showAddForm && (
        <TodoAddForm
          currentProfileId={currentProfileId}
          currentUserId={currentUserId}
          users={users}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <TodoFilter filter={filter} setFilter={setFilter} />

      <ul className="flex flex-col gap-3">
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
