export interface Todo {
  id: string;
  task: string;
  isDone: boolean;
  comment: string;
  assigned_to_id: string;
  created_by_id: string;
  assigned?: { name: string };
  creator?: { name: string };
}
