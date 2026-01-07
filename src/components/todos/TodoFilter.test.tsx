import { render, screen, fireEvent } from '@testing-library/react';
import TodoFilter from './TodoFilter';
import React from 'react';

describe('TodoFilter', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter options', () => {
    render(<TodoFilter value="open" onChange={onChange} />);
    expect(screen.getByText(/open/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/all/i)).toBeInTheDocument();
  });

  it('calls onChange when filter is clicked', () => {
    render(<TodoFilter value="open" onChange={onChange} />);
    fireEvent.click(screen.getByText(/done/i));
    expect(onChange).toHaveBeenCalledWith('done');
  });
});
