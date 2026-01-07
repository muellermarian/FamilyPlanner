import { render, screen, fireEvent } from '@testing-library/react';
import TodoEditForm from './TodoEditForm';

describe('TodoEditForm', () => {
  const users = [
    { id: '1', name: 'Anna' },
    { id: '2', name: 'Ben' },
  ];
  const todo = {
    id: '1',
    task: 'Test todo',
    description: 'Test description',
    isDone: false,
    assigned_to_id: '2',
    created_by_id: '1',
    created_at: '',
  };
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit fields and buttons', () => {
    render(<TodoEditForm todo={todo} users={users} onClose={onClose} />);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /speichern/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abbrechen/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<TodoEditForm todo={todo} users={users} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
