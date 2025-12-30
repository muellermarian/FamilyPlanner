export interface Todo {
  id: string;
  task: string;
  isDone: boolean;
  comment: string;
  assigned_to_id: string | null;
  created_by_id: string;
  done_by_id: string | null;
  done_at: string | null;
  due_at: string | null;
  assigned?: { name: string } | null;
  creator?: { name: string } | null;
  done_by?: { name: string } | null;
  created_at?: string;
}
