// Calendar API functions for fetching and managing calendar-related data
import { supabase } from './supabaseClient';
import type { CalendarEvent, Todo, Contact, ShoppingItem } from './types';

// Fetch all calendar events for a family
export async function getCalendarEvents(familyId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('family_id', familyId)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch todos with due dates for calendar view
export async function getTodosForCalendar(familyId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select(
      `
      *,
      assigned:profiles!todos_assigned_to_id_fkey(id, name),
      creator:profiles!todos_created_by_id_fkey(id, name),
      done_by:profiles!todos_done_by_id_fkey(id, name)
    `
    )
    .eq('family_id', familyId)
    .not('due_at', 'is', null)
    .order('due_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch contacts with birthdays for calendar view
export async function getBirthdaysForCalendar(familyId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('family_id', familyId)
    .not('birthdate', 'is', null)
    .order('birthdate', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch shopping items with deal dates for calendar view
export async function getShoppingItemsForCalendar(familyId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('family_id', familyId)
    .not('deal_date', 'is', null)
    .order('deal_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Add a new calendar event
export async function addCalendarEvent(
  familyId: string,
  title: string,
  eventDate: string,
  eventTime: string,
  description: string,
  createdById: string
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([
      {
        family_id: familyId,
        title,
        event_date: eventDate,
        event_time: eventTime || null,
        description: description || null,
        created_by_id: createdById,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update an existing calendar event
export async function updateCalendarEvent(
  eventId: string,
  title: string,
  eventDate: string,
  eventTime: string,
  description: string
): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .update({
      title,
      event_date: eventDate,
      event_time: eventTime || null,
      description: description || null,
    })
    .eq('id', eventId);

  if (error) throw error;
}

// Delete a calendar event by ID
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);

  if (error) throw error;
}
