// Import test utilities and the component under test
import { render, screen } from '@testing-library/react';
import MinimalTodoView from './MinimalTodoView';

// Test suite for MinimalTaskView component
describe('MinimalTodoView', () => {
  // Sample data for testing: two tasks, one open and one completed
  const todos = [
    { id: '1', task: 'Test todo', isDone: false, created_by_id: '1' },
    { id: '2', task: 'Done todo', isDone: true, created_by_id: '1' },
  ];
  // Loading state for the component
  const loading = false;
  // Mock functions for toggling and editing tasks
  const onToggle = vi.fn();
  const onEdit = vi.fn();

  // Reset all mock function calls before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test: should render the count of open tasks
  it('renders open task count', () => {
    render(<MinimalTodoView todos={todos} loading={loading} onToggle={onToggle} onEdit={onEdit} />);
    expect(screen.getByText(/1 offen/i)).toBeInTheDocument();
  });

  // Test: should render all task texts, checkboxes, and edit buttons
  it('renders all task texts, checkboxes, and edit buttons', () => {
    render(<MinimalTodoView todos={todos} loading={loading} onToggle={onToggle} onEdit={onEdit} />);
    // Check that all task texts are rendered
    todos.forEach((entry) => {
      expect(screen.getByText(entry.task)).toBeInTheDocument();
    });
    // Check that there is one checkbox per task entry
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(todos.length);
    // Check that there is one edit button (✏️) per task entry
    const editButtons = screen.getAllByRole('button', { name: /✏️/ });
    expect(editButtons).toHaveLength(todos.length);
  });
});
