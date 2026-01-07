import { useState } from 'react';
import type { Todo, TodoFilterType } from '../../lib/types';
import { TodoItem, TodoAddForm, TodoFilter, TodoEditForm } from './index';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';
import { useTodos } from './useTodos';
import MinimalTodoView from './MinimalTodoView';

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
  const [filter, setFilter] = useState<TodoFilterType>('open');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [minimalMode, setMinimalMode] = useState(false);
  const { toast, showToast } = useToast();

  const { todos, loading, error, commentMeta, fetchTodos, handleAdd, handleToggle, handleDelete } =
    useTodos(familyId, filter, currentUserId, currentProfileId, showToast);

  const onAdd = async (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => {
    const success = await handleAdd(task, assignedTo, description, dueDate);
    if (success) setShowAddForm(false);
  };

  return (
    <PullToRefresh onRefresh={fetchTodos}>
      <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Todo Liste</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMinimalMode(!minimalMode)}
              className={`px-3 py-1 rounded font-medium text-sm ${
                minimalMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={minimalMode ? 'Detailansicht' : 'Minimalansicht'}
            >
              👁️
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

        {/* Add Form */}
        {showAddForm && !editTodo && (
          <TodoAddForm
            currentProfileId={currentProfileId}
            currentUserId={currentUserId}
            users={users}
            onAdd={onAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Edit Form */}
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

        {/* Views */}
        {!editTodo && (minimalMode ? (
          <MinimalTodoView
            todos={todos}
            loading={loading}
            onToggle={handleToggle}
            onEdit={setEditTodo}
          />
        ) : (
          <>
            <TodoFilter filter={filter} setFilter={setFilter} />
            <div className="mb-2 text-sm text-gray-600">
              {loading ? '🔄 Lade Todos…' : `${todos.length} Todos geladen`}
            </div>
            {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}
            <ul className="flex flex-col gap-3">
              {todos.map((todo) => (
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
        ))}

        {toast && <Toast message={toast} />}
      </div>
    </PullToRefresh>
  );
}
