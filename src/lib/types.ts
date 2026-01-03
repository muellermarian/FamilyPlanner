export interface Profile {
  id: string;
  user_id: string;
  family_id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile | null;
}

export interface Todo {
  id: string;
  task: string;
  description?: string;
  isDone: boolean;
  assigned_to_id?: string | null;
  created_by_id: string;
  done_by_id?: string | null;
  done_at?: string | null;
  due_at?: string | null;

  // Optional: relational data
  assigned?: Profile | null;
  creator?: Profile | null;
  done_by?: Profile | null;

  created_at?: string;
}

export interface Todo_Comment {
  id: string;
  text: string;
  todo_id: string;
  user_id: string;
  created_at: string;
}

export type TodoFilterType = 'open' | 'done' | 'all';

export interface ShoppingItem {
  id: string;
  family_id: string;
  name: string;
  quantity: string;
  unit: string;
  created_by_id: string;
  created_at?: string;
}

export interface ShoppingPurchase {
  id: string;
  family_id: string;
  purchased_at: string;
  purchased_by_id: string;
  items: ShoppingPurchaseItem[];
}

export interface ShoppingPurchaseItem {
  id: string;
  purchase_id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  family_id: string;
  name: string;
  image_url?: string;
  instructions?: string;
  servings?: number;
  created_by_id: string;
  created_at?: string;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
  order_index: number;
}

export interface RecipeCooking {
  id: string;
  recipe_id: string;
  family_id: string;
  marked_at: string;
  marked_by_id: string;
  cooked_at?: string | null;
  cooked_by_id?: string | null;
}

export interface ContactFamily {
  id: string;
  family_id: string;
  family_name: string;
  street?: string;
  house_number?: string;
  zip?: string;
  city?: string;
  country?: string;
  created_at?: string;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  family_id: string;
  contact_family_id?: string | null;
  first_name: string;
  last_name: string;
  birthdate?: string;
  phone?: string;
  phone_landline?: string;
  email?: string;
  street?: string;
  house_number?: string;
  zip?: string;
  city?: string;
  country?: string;
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  created_by_id: string;
  created_at?: string;
}

export interface AgendaItem {
  type: 'event' | 'todo' | 'birthday';
  title: string;
  id: string;
  date: Date;
  time?: string;
  description?: string;
  data: CalendarEvent | Todo | Contact;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: AgendaItem[];
}
