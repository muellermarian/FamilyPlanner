import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';

describe('TodoItem', () => {
  const todo = {
    id: '1',
    task: 'Test todo',
    description: 'Test description',
    isDone: false,
    assigned_to_id: '2',
    created_by_id: '1',
    created_at: '',
  };
  const users = [
    { id: '1', name: 'Anna' },
    { id: '2', name: 'Ben' },
  ];
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo task and description', () => {
    render(
      <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} users={users} onEdit={onEdit} />
    );
    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(
      <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} users={users} onEdit={onEdit} />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(todo);
  });
});
