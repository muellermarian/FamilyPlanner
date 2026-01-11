import { useState } from 'react';
// Import React's useState hook for managing local component state
import type { Todo, TodoFilterType } from '../../lib/types';
// Import type definitions for task and filter types
import TodoItem from './TodoItem';
// Import the item component for rendering individual tasks
import TodoAddForm from './TodoAddForm';
// Import the form component for adding new tasks
import TodoEditForm from './TodoEditForm';
// Import the form component for editing existing tasks
import TodoFilter from './TodoFilter';
// Import the filter component to switch between task states
import { useToast } from '../../hooks/useToast';
// Import custom hook for showing toast notifications
import Toast from '../shared/Toast';
// Import the Toast component for displaying messages
import { PullToRefresh } from '../shared/PullToRefresh';
// Import PullToRefresh wrapper for refreshing tasks by swipe gesture
import { useTodos } from './useTodos';
// Import custom hook for fetching and managing tasks
import MinimalTodoView from './MinimalTodoView';
// Import minimal view component for tasks

// Props interface for the task list component
interface TodoListProps {
  readonly familyId: string; // ID of the family group
  readonly currentUserId: string; // ID of the current user
  readonly currentProfileId: string; // ID of the current profile
  readonly users: { id: string; name: string }[]; // List of users for assignment
}

export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  // State for current filter (e.g., open, completed)
  const [filter, setFilter] = useState<TodoFilterType>('open');
  // State to show/hide the add form
  const [showAddForm, setShowAddForm] = useState(false);
  // State for the item being edited (null if none)
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  // State for toggling minimal view mode
  const [minimalMode, setMinimalMode] = useState(false);
  // Toast state and handler from custom hook
  const { toast, showToast } = useToast();

  // Custom hook to fetch tasks and provide handlers
  const {
    todos, // Array of tasks
    loading, // Loading state
    error, // Error message if fetch fails
    commentMeta, // Metadata for comments on tasks
    fetchTodos, // Function to refresh tasks
    handleAdd, // Handler to add a new task
    handleToggle, // Handler to toggle task completion
    handleDelete, // Handler to delete a task
  } = useTodos(familyId, filter, currentUserId, currentProfileId, showToast);

  // Handler for adding a new task
  const onAdd = async (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => {
    const success = await handleAdd(task, assignedTo, description, dueDate);
    if (success) setShowAddForm(false); // Hide add form on success
  };

  return (
    // PullToRefresh allows users to refresh the list by swiping down
    <PullToRefresh onRefresh={fetchTodos}>
      <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
        {/* Header section with title and view/add buttons */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Todo Liste</h2>
          <div className="flex gap-2">
            {/* Button to toggle minimal/detail view */}
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
            {/* Button to show add form, only visible if not already adding */}
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

        {/* Show add form if requested and not editing */}
        {showAddForm && !editTodo && (
          <TodoAddForm
            currentProfileId={currentProfileId}
            currentUserId={currentUserId}
            users={users}
            onAdd={onAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Show edit form if an item is being edited */}
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

        {/* Main views: minimal or detailed */}
        {!editTodo &&
          (minimalMode ? (
            // Minimal view for tasks
            <MinimalTodoView
              todos={todos}
              loading={loading}
              onToggle={handleToggle}
              onEdit={setEditTodo}
            />
          ) : (
            <>
              {/* Filter component to switch state */}
              <TodoFilter filter={filter} setFilter={setFilter} />
              {/* Show loading or count of loaded items */}
              <div className="mb-2 text-sm text-gray-600">
                {loading ? '🔄 Lade Todos…' : `${todos.length} Todos geladen`}
              </div>
              {/* Show error if present */}
              {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}
              {/* List of tasks */}
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

        {/* Show toast notification if present */}
        {toast && <Toast message={toast} />}
      </div>
    </PullToRefresh>
  );
}
