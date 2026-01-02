import type { CalendarEvent, Todo, Contact, AgendaItem, CalendarDay } from '../../lib/types';

export function createAgendaItems(
  calendarEvents: CalendarEvent[],
  todos: Todo[],
  birthdays: Contact[],
  viewMode: 'upcoming' | 'all' | 'calendar'
): AgendaItem[] {
  const items: AgendaItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add calendar events
  calendarEvents.forEach((event) => {
    const eventDate = new Date(event.event_date);
    if (viewMode === 'calendar' || viewMode === 'all' || eventDate >= today) {
      items.push({
        type: 'event',
        title: event.title,
        id: event.id,
        date: eventDate,
        time: event.event_time,
        description: event.description,
        data: event,
      });
    }
  });

  // Add todos with due dates
  todos.forEach((todo) => {
    if (todo.due_at) {
      const dueDate = new Date(todo.due_at);
      if (viewMode === 'calendar' || viewMode === 'all' || dueDate >= today) {
        items.push({
          type: 'todo',
          title: todo.task,
          id: todo.id,
          date: dueDate,
          description: todo.description,
          data: todo,
        });
      }
    }
  });

  // Add birthdays for current year
  const currentYear = new Date().getFullYear();
  birthdays.forEach((contact) => {
    if (contact.birthdate) {
      const bdayDate = new Date(contact.birthdate);
      const thisYearBday = new Date(currentYear, bdayDate.getMonth(), bdayDate.getDate());
      if (viewMode === 'calendar' || viewMode === 'all' || thisYearBday >= today) {
        items.push({
          type: 'birthday',
          title: `${contact.first_name} ${contact.last_name}`,
          id: contact.id,
          date: thisYearBday,
          data: contact,
        });
      }
    }
  });

  // Sort by date
  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function createCalendarDays(
  currentMonth: Date,
  calendarEvents: CalendarEvent[],
  todos: Todo[],
  birthdays: Contact[]
): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  // Adjust for German calendar (Monday = 0, Sunday = 6)
  const dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  startDate.setDate(startDate.getDate() - dayOffset);

  const days: CalendarDay[] = [];
  const currentDay = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    const dateStr = currentDay.toISOString().split('T')[0];
    const isCurrentMonth = currentDay.getMonth() === month;
    const dayEvents: AgendaItem[] = [];

    // Add calendar events
    calendarEvents.forEach((event) => {
      if (event.event_date === dateStr) {
        dayEvents.push({
          type: 'event',
          title: event.title,
          id: event.id,
          date: new Date(event.event_date),
          time: event.event_time,
          data: event,
        });
      }
    });

    // Add todos
    todos.forEach((todo) => {
      if (todo.due_at && todo.due_at.startsWith(dateStr)) {
        dayEvents.push({
          type: 'todo',
          title: todo.task,
          id: todo.id,
          date: new Date(todo.due_at),
          data: todo,
        });
      }
    });

    // Add birthdays
    birthdays.forEach((contact) => {
      if (contact.birthdate) {
        const bdayDate = new Date(contact.birthdate);
        if (
          bdayDate.getMonth() === currentDay.getMonth() &&
          bdayDate.getDate() === currentDay.getDate()
        ) {
          const age = year - bdayDate.getFullYear();
          dayEvents.push({
            type: 'birthday',
            title: `${contact.first_name} ${contact.last_name}`,
            id: contact.id,
            date: new Date(currentDay),
            description: `wird ${age}`,
            data: contact,
          });
        }
      }
    });

    days.push({
      date: new Date(currentDay),
      isCurrentMonth,
      events: dayEvents,
    });

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return days;
}
