import type {
  CalendarEvent,
  Todo,
  Contact,
  ShoppingItem,
  AgendaItem,
  CalendarDay,
} from '../../lib/types';

// Converts a time string from HH:MM:SS format to HH:MM format
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  // If the time is in HH:MM:SS format, extract only the HH:MM part
  if (time.includes(':')) {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

// Returns the next full hour as a string in HH:MM format
export function getNextFullHour(): string {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  const hours = String(nextHour.getHours()).padStart(2, '0');
  const minutes = '00';
  return `${hours}:${minutes}`;
}

// Returns the Date object for Monday of the current week
export function getWeekStart(date: Date = new Date()): Date {
  const weekday = date.getDay();
  // Calculate the difference to Monday (if Sunday, go back 6 days)
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);
  return start;
}

// Get the appropriate icon/emoji for an agenda item type
export function getEventIcon(type: string, data?: any): string {
  switch (type) {
    case 'birthday':
      return '🎂';
    case 'shopping':
      return '🛒';
    case 'todo':
      return data?.isDone ? '✅' : '⬜';
    case 'event':
    default:
      return '📅';
  }
}

// Get background color classes for an agenda item type
export function getEventColorClasses(type: string): string {
  switch (type) {
    case 'event':
      return 'bg-blue-100 text-blue-900';
    case 'todo':
      return 'bg-green-100 text-green-900';
    case 'birthday':
      return 'bg-pink-100 text-pink-900';
    case 'shopping':
      return 'bg-orange-100 text-orange-900';
    default:
      return 'bg-gray-100 text-gray-900';
  }
}

// Get border color classes for detail view
export function getEventBorderClasses(type: string): string {
  switch (type) {
    case 'event':
      return 'bg-blue-50 border-l-blue-500';
    case 'todo':
      return 'bg-green-50 border-l-green-500';
    case 'shopping':
      return 'bg-orange-50 border-l-orange-500';
    case 'birthday':
      return 'bg-pink-50 border-l-pink-500';
    default:
      return 'bg-gray-50 border-l-gray-500';
  }
}

export function createAgendaItems(
  calendarEvents: CalendarEvent[],
  todos: Todo[],
  birthdays: Contact[],
  shoppingItems: ShoppingItem[],
  viewMode: 'upcoming' | 'calendar' | 'week'
): AgendaItem[] {
  const items: AgendaItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // For 'upcoming' mode, calculate 7 days from today
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // Helper to parse ISO date string to local date
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Add calendar events
  calendarEvents.forEach((event) => {
    const eventDate = parseDate(event.event_date);
    if (viewMode === 'calendar' || 
        (viewMode === 'upcoming' && eventDate >= today && eventDate < sevenDaysFromNow) ||
        (viewMode === 'week' && eventDate >= today)) {
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
      if (viewMode === 'calendar' || 
          (viewMode === 'upcoming' && dueDate >= today && dueDate < sevenDaysFromNow) ||
          (viewMode === 'week' && dueDate >= today)) {
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
      if (viewMode === 'calendar' || 
          (viewMode === 'upcoming' && dealDate >= today && dealDate < sevenDaysFromNow) ||
          (viewMode === 'week' && dealDate >= today)) {
        const title = item.store ? `${item.name} (${item.store})` : item.name;
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
      if (viewMode === 'calendar' || 
          (viewMode === 'upcoming' && thisYearBday >= today && thisYearBday < sevenDaysFromNow) ||
          (viewMode === 'week' && thisYearBday >= today)) {
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
      // Check if the due date matches the current day (compare only the date part)
      if (todo.due_at?.split('T')[0] === dateStr) {
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
        const title = item.store ? `${item.name} (${item.store})` : item.name;
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

// Build all agenda items for a specific day
export function buildDayAgenda(
  date: Date,
  calendarEvents: CalendarEvent[],
  todos: Todo[],
  birthdays: Contact[],
  shoppingItems: ShoppingItem[],
  commentsByTodoId?: Record<string, { text: string }[]>
): AgendaItem[] {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
  const day = String(normalizedDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const dayItems: AgendaItem[] = [];

  calendarEvents.forEach((event) => {
    if (event.event_date === dateStr) {
      dayItems.push({
        type: 'event',
        title: event.title,
        id: event.id,
        date: normalizedDate,
        time: event.event_time,
        description: event.description,
        data: event,
      });
    }
  });

  todos.forEach((todo) => {
    if (todo.due_at?.startsWith(dateStr)) {
      // Comments
      let todoWithComments = todo;
      if (commentsByTodoId?.[todo.id]) {
        todoWithComments = { ...todo, comments: commentsByTodoId[todo.id] } as Todo & { comments: { text: string }[] };
      }
      dayItems.push({
        type: 'todo',
        title: todo.task,
        id: todo.id,
        date: normalizedDate,
        description: todo.description,
        data: todoWithComments,
      });
    }
  });

  birthdays.forEach((contact) => {
    if (contact.birthdate) {
      const bdayDate = new Date(contact.birthdate);
      if (
        bdayDate.getMonth() === normalizedDate.getMonth() &&
        bdayDate.getDate() === normalizedDate.getDate()
      ) {
        dayItems.push({
          type: 'birthday',
          title: `${contact.first_name} ${contact.last_name}`,
          id: contact.id,
          date: normalizedDate,
          data: contact,
        });
      }
    }
  });

  shoppingItems.forEach((item) => {
    if (item.deal_date === dateStr) {
      const title = item.store ? `${item.name} (${item.store})` : item.name;
      dayItems.push({
        type: 'shopping',
        title,
        id: item.id,
        date: normalizedDate,
        description: `${item.quantity} ${item.unit}`,
        data: item,
      });
    }
  });

  return dayItems;
}

// Get ISO week number
export function getISOWeek(date: Date): number {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}
