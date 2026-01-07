import { render, screen } from '@testing-library/react';
import MinimalTodoView from './MinimalTodoView';

describe('MinimalTodoView', () => {
  const todos = [
    { id: '1', task: 'Test todo', isDone: false, created_by_id: '1' },
    { id: '2', task: 'Done todo', isDone: true, created_by_id: '1' },
  ];
  const loading = false;
  const onToggle = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders open todo count', () => {
    render(<MinimalTodoView todos={todos} loading={loading} onToggle={onToggle} onEdit={onEdit} />);
    expect(screen.getByText(/1 offen/i)).toBeInTheDocument();
  });

  it('renders all todo tasks, checkboxes, and edit buttons', () => {
    render(<MinimalTodoView todos={todos} loading={loading} onToggle={onToggle} onEdit={onEdit} />);
    // Check that all todo texts are rendered
    todos.forEach((todo) => {
      expect(screen.getByText(todo.task)).toBeInTheDocument();
    });
    // Check that there is one checkbox per todo
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(todos.length);
    // Check that there is one edit button (✏️) per todo
    const editButtons = screen.getAllByRole('button', { name: /✏️/ });
    expect(editButtons).toHaveLength(todos.length);
  });
});
