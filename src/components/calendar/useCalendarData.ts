// React hook to manage and fetch calendar-related data for a family
import { useState, useEffect } from 'react';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
  getShoppingItemsForCalendar,
} from '../../lib/calendar';
import { supabase } from '../../lib/supabaseClient';
import type { CalendarEvent, Todo, Contact, ShoppingItem } from '../../lib/types';

export function useCalendarData(familyId: string) {
  // State for calendar events, todos, birthdays, shopping items, and loading status
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [birthdays, setBirthdays] = useState<Contact[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all calendar data for the given familyId
  const fetchData = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      // Fetch events, todos, birthdays, and shopping items in parallel
      const [events, todosData, birthdaysData, shoppingData] = await Promise.all([
        getCalendarEvents(familyId),
        getTodosForCalendar(familyId),
        getBirthdaysForCalendar(familyId),
        getShoppingItemsForCalendar(familyId),
      ]);

      // Load comments for todos
      let todosWithComments = todosData;
      if (todosData.length > 0) {
        const todoIds = todosData.map((t: any) => t.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('todo_comments')
          .select('todo_id, text, user_id, created_at')
          .in('todo_id', todoIds)
          .order('created_at', { ascending: false });
        if (!commentsError && Array.isArray(commentsData)) {
          const commentsByTodo: Record<string, any[]> = {};
          for (const c of commentsData) {
            if (!commentsByTodo[c.todo_id]) commentsByTodo[c.todo_id] = [];
            commentsByTodo[c.todo_id].push(c);
          }
          todosWithComments = todosData.map((t: any) => ({
            ...t,
            comments: commentsByTodo[t.id] || [],
          }));
        }
      }

      setCalendarEvents(events);
      setTodos(todosWithComments);
      setBirthdays(birthdaysData);
      setShoppingItems(shoppingData);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch data whenever the familyId changes
  useEffect(() => {
    fetchData();
  }, [familyId]);

  // Return all calendar data and loading state
  return { calendarEvents, todos, birthdays, shoppingItems, loading, fetchData };
}
