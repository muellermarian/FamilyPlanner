import { render, screen, fireEvent } from '@testing-library/react';
import TodoAddForm from './TodoAddForm';

describe('TodoAddForm', () => {
  const users = [
    { id: '1', name: 'Anna' },
    { id: '2', name: 'Ben' },
  ];
  const currentProfileId = '1';
  const currentUserId = '1';
  const onAdd = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all input fields and buttons', () => {
    render(
      <TodoAddForm
        currentProfileId={currentProfileId}
        currentUserId={currentUserId}
        users={users}
        onAdd={onAdd}
        onCancel={onCancel}
      />
    );
    // Task input
    expect(screen.getByPlaceholderText(/^Neue Aufgabe/i)).toBeInTheDocument();
    // Description textarea
    expect(screen.getByPlaceholderText(/^Beschreibung/i)).toBeInTheDocument();
    // Due date input (label)
    expect(screen.getByText(/^Fällig am/i)).toBeInTheDocument();
    // Assigned select (label)
    expect(screen.getByText(/^Zugewiesen an/i)).toBeInTheDocument();
    // Add button
    expect(screen.getByRole('button', { name: /hinzufügen/i })).toBeInTheDocument();
    // Cancel button
    expect(screen.getByRole('button', { name: /abbrechen/i })).toBeInTheDocument();
  });

  it('calls onAdd with correct values', () => {
    render(
      <TodoAddForm
        currentProfileId={currentProfileId}
        currentUserId={currentUserId}
        users={users}
        onAdd={onAdd}
        onCancel={onCancel}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/^Neue Aufgabe/i), {
      target: { value: 'Test task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /hinzufügen/i }));
    expect(onAdd).toHaveBeenCalledWith('Test task', expect.anything(), '', null);
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(
      <TodoAddForm
        currentProfileId={currentProfileId}
        currentUserId={currentUserId}
        users={users}
        onAdd={onAdd}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
