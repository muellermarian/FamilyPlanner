import type {
  CalendarEvent,
  Todo,
  Contact,
  ShoppingItem,
  AgendaItem,
  CalendarDay,
} from '../../lib/types';

export function createAgendaItems(
  calendarEvents: CalendarEvent[],
  todos: Todo[],
  birthdays: Contact[],
  shoppingItems: ShoppingItem[],
  viewMode: 'upcoming' | 'all' | 'calendar' | 'week'
): AgendaItem[] {
  const items: AgendaItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to parse ISO date string to local date
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Add calendar events
  calendarEvents.forEach((event) => {
    const eventDate = parseDate(event.event_date);
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
      const dueDate = parseDate(todo.due_at.split('T')[0]);
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

  // Add shopping items with deal dates
  shoppingItems.forEach((item) => {
    if (item.deal_date) {
      const dealDate = parseDate(item.deal_date);
      if (viewMode === 'calendar' || viewMode === 'all' || dealDate >= today) {
        const title = item.store ? `🛒 ${item.name} (${item.store})` : `🛒 ${item.name}`;
        items.push({
          type: 'shopping',
          title,
          id: item.id,
          date: dealDate,
          description: `${item.quantity} ${item.unit}`,
          data: item,
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
  birthdays: Contact[],
  shoppingItems: ShoppingItem[]
): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  // Adjust for German calendar (Monday = 0, Sunday = 6)
  const dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  startDate.setDate(startDate.getDate() - dayOffset);

  // Helper to parse ISO date string to local date
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const days: CalendarDay[] = [];
  const currentDay = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    // Create date string from local date, not UTC!
    const year = currentDay.getFullYear();
    const monthNum = currentDay.getMonth() + 1;
    const monthStr = String(monthNum).padStart(2, '0');
    const day = String(currentDay.getDate()).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${day}`;
    const isCurrentMonth = currentDay.getMonth() === month;
    const dayEvents: AgendaItem[] = [];

    // Add calendar events
    calendarEvents.forEach((event) => {
      if (event.event_date === dateStr) {
        dayEvents.push({
          type: 'event',
          title: event.title,
          id: event.id,
          date: parseDate(event.event_date),
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
          date: parseDate(todo.due_at.split('T')[0]),
          data: todo,
        });
      }
    });

    // Add birthdays
    birthdays.forEach((contact) => {
      if (contact.birthdate) {
        const bdayDateStr =
          typeof contact.birthdate === 'string'
            ? contact.birthdate.split('T')[0]
            : contact.birthdate;
        const bdayDate = parseDate(bdayDateStr);
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

    // Add shopping items with deal dates
    shoppingItems.forEach((item) => {
      if (item.deal_date === dateStr) {
        const title = item.store ? `🛒 ${item.name} (${item.store})` : `🛒 ${item.name}`;
        dayEvents.push({
          type: 'shopping',
          title,
          id: item.id,
          date: parseDate(item.deal_date),
          description: `${item.quantity} ${item.unit}`,
          data: item,
        });
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
