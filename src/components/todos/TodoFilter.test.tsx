import { render, screen, fireEvent } from '@testing-library/react';
import TodoFilter from './TodoFilter';

describe('TodoFilter', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter options', () => {
    render(<TodoFilter filter="open" setFilter={onChange} />);
    expect(screen.getByText(/offene todos/i)).toBeInTheDocument();
    expect(screen.getByText(/erledigt/i)).toBeInTheDocument();
    expect(screen.getByText(/alle/i)).toBeInTheDocument();
  });

  it('calls onChange when filter is clicked', () => {
    render(<TodoFilter filter="open" setFilter={onChange} />);
    fireEvent.click(screen.getByText(/erledigt/i));
    expect(onChange).toHaveBeenCalledWith('done');
  });
});
