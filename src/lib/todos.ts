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
      assigned:profiles!todos_assigned_to_id_fkey(user_id, name),
      creator:profiles!todos_created_by_id_fkey(user_id, name)
    `
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const normalized = (data ?? []).map((t: any) => ({
    ...t,
    assigned: Array.isArray(t.assigned) ? t.assigned[0] ?? null : t.assigned ?? null,
    creator: Array.isArray(t.creator) ? t.creator[0] ?? null : t.creator ?? null,
  }));

  return normalized as Todo[];
};

// Add a new todo for a family
export const addTodo = async (
  familyId: string,
  task: string,
  assignedToId: string | null,
  createdById: string,
  comment?: string
) => {
  const insertData: any = {
    family_id: familyId,
    task,
    created_by_id: createdById,
  };

  if (assignedToId) {
    insertData.assigned_to_id = assignedToId;
  }

  if (comment) {
    insertData.comment = comment;
  }

  const { data, error } = await supabase.from('todos').insert(insertData);
  if (error) throw error;
  return data;
};

// Toggle todo completion status
export const toggleTodo = async (id: string, isDone: boolean) => {
  const { data, error } = await supabase
    .from('todos')
    .update({ isDone: isDone })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};

// Delete a todo by ID
export async function deleteTodo(id: string) {
  const { error } = await supabase.from('todos').delete().eq('id', id);

  if (error) throw error;
}
