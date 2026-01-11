// Types for user profile information
export interface Profile {
  id: string;
  user_id: string;
  family_id: string;
  name: string;
}

// Types for authentication user
export interface User {
  id: string;
  email: string;
  profile?: Profile | null;
}

// Types for task items
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

  // Optional: relational data for task
  assigned?: Profile | null;
  creator?: Profile | null;
  done_by?: Profile | null;

  created_at?: string;
}

// Types for comments on todos
export interface TodoComment {
  id: string;
  text: string;
  todo_id: string;
  user_id: string;
  created_at: string;
}

// Filter type for todos
export type TodoFilterType = 'open' | 'done' | 'all';

// Types for shopping list items
export interface ShoppingItem {
  id: string;
  family_id: string;
  name: string;
  quantity: string;
  unit: string;
  created_by_id: string;
  created_at?: string;
  store?: string | null;
  deal_date?: string | null;
}

// Types for shopping purchases
export interface ShoppingPurchase {
  id: string;
  family_id: string;
  purchased_at: string;
  purchased_by_id: string;
  items: ShoppingPurchaseItem[];
}

// Types for individual items in a shopping purchase
export interface ShoppingPurchaseItem {
  id: string;
  purchase_id: string;
  name: string;
  quantity: string;
  unit: string;
}

// Types for recipes
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

// Types for recipe ingredients
export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
  order_index: number;
}

// Types for recipe cooking events
export interface RecipeCooking {
  id: string;
  recipe_id: string;
  family_id: string;
  marked_at: string;
  marked_by_id: string;
  cooked_at?: string | null;
  cooked_by_id?: string | null;
}

// Types for contact families
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

// Types for individual contacts
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

// Types for calendar events
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

// Types for agenda items in the calendar
export interface AgendaItem {
  type: 'event' | 'todo' | 'birthday' | 'shopping';
  title: string;
  id: string;
  date: Date;
  time?: string;
  description?: string;
  data: CalendarEvent | Todo | Contact | ShoppingItem;
}

// Types for a single day in the calendar
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: AgendaItem[];
}
