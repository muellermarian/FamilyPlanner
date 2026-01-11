import { useEffect, useState } from 'react';
// Import React hooks for state and effect management
import { supabase } from '../../lib/supabaseClient';
// Import Supabase client for database operations
import type { Todo, TodoFilterType } from '../../lib/types';
// Import type definitions for task and filter
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../../lib/todos';
// Import functions for fetching, adding, toggling, and deleting tasks

// Type for storing comment metadata for each task
type CommentMeta = Record<
  string,
  { count: number; comments?: { text: string; user_id?: string; created_at?: string }[] }
>;
export function useTodos(
  familyId: string,
  filter: TodoFilterType,
  currentUserId: string,
  currentProfileId: string,
  showToast: (message: string) => void
) {
  // State for the list of tasks
  const [todos, setTodos] = useState<Todo[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // State for comment metadata per task
  const [commentMeta, setCommentMeta] = useState<CommentMeta>({});

  // Function to fetch tasks and their comments from the database
  const fetchTodos = async () => {
    setLoading(true); // Start loading
    setError(null);   // Reset error
    try {
      // Fetch tasks for the given family and filter
      const data = await getTodosForFamily(familyId, filter);
      const todosLoaded = data ?? [];
      setTodos(todosLoaded);

      // If there are tasks, fetch their comments
      if (todosLoaded.length > 0) {
        const todoIds = todosLoaded.map((t) => t.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('todo_comments')
          .select('todo_id, text, user_id, created_at')
          .in('todo_id', todoIds)
          .order('created_at', { ascending: false });

        // Map comments to each task
        if (commentsError) {
          setCommentMeta({});
        } else if (commentsData) {
          const map: CommentMeta = {};
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
      setLoading(false); // End loading
    }
  };

  // Fetch tasks whenever familyId or filter changes
  useEffect(() => {
    fetchTodos();
  }, [familyId, filter]);

  // Handler for adding a new task
  const handleAdd = async (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => {
    try {
      // Add the new task to the database
      await addTodo(
        familyId,
        task,
        assignedTo,
        currentProfileId || currentUserId,
        description,
        dueDate
      );
      // Refresh the list after adding
      await fetchTodos();
      showToast('Aufgabe hinzugefügt ✓');
      return true;
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
      return false;
    }
  };

  // Handler for toggling the completion state of a task
  const handleToggle = async (todo: Todo) => {
    try {
      // Determine who completed the task
      const doneById = todo.isDone ? null : currentProfileId || currentUserId;

      // Show feedback to the user
      if (todo.isDone) {
        showToast(`"${todo.task}" wieder geöffnet`);
      } else {
        showToast(`"${todo.task}" erledigt ✓`);
      }

      // Update the completion state in the database
      await toggleTodo(todo.id, !todo.isDone, doneById);
      // Refresh the list after toggling
      await fetchTodos();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handler for deleting a task
  const handleDelete = async (id: string) => {
    try {
      // Delete the task from the database
      await deleteTodo(id);
      // Refresh the list after deletion
      await fetchTodos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Return all state and handlers for use in components
  return { todos, loading, error, commentMeta, fetchTodos, handleAdd, handleToggle, handleDelete };
}
