import { supabase } from './supabaseClient';
import type { Todo } from './types';

export const getTodosForFamily = async (familyId: string): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select(
      `
      id,
      task,
      isDone,
      comment,
      assigned_to_id,
      created_by_id,
      done_by_id,
      done_at,
      due_at,
      created_at,
      assigned:profiles!todos_assigned_to_id_fkey(user_id, name),
      creator:profiles!todos_created_by_id_fkey(user_id, name),
      done_by:profiles!todos_done_by_id_fkey(name)
    `
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const normalized = (data ?? []).map((t: any) => ({
    ...t,
    assigned: Array.isArray(t.assigned) ? t.assigned[0] ?? null : t.assigned ?? null,
    creator: Array.isArray(t.creator) ? t.creator[0] ?? null : t.creator ?? null,
    done_by: Array.isArray(t.done_by) ? t.done_by[0] ?? null : t.done_by ?? null,
  }));

  return normalized as Todo[];
};

// Add a new todo for a family
export const addTodo = async (
  familyId: string,
  task: string,
  assignedToId: string | null,
  createdById: string,
  comment?: string,
  dueAt?: string | null
) => {
  const insertData: any = {
    family_id: familyId,
    task,
    created_by_id: createdById,
  };

  if (assignedToId) insertData.assigned_to_id = assignedToId;
  if (comment) insertData.comment = comment;
  if (dueAt) insertData.due_at = dueAt;

  const { data, error } = await supabase.from('todos').insert(insertData).select('*');

  if (error) throw error;

  return data;
};

// Toggle todo completion status
export const toggleTodo = async (id: string, isDone: boolean, doneById?: string | null) => {
  const updateData: any = { isDone };
  if (isDone) {
    updateData.done_by_id = doneById;
    updateData.done_at = new Date().toISOString();
  } else {
    updateData.done_by_id = null;
    updateData.done_at = null;
  }

  const { error } = await supabase.from('todos').update(updateData).eq('id', id);
  if (error) throw error;
};

export async function deleteTodo(id: string) {
  const confirmed = window.confirm('Todo wirklich löschen?');
  if (!confirmed) return;

  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
}
