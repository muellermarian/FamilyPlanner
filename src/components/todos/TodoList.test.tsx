import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';
import React from 'react';

describe('TodoList', () => {
  const users = [
    { id: '1', name: 'Anna' },
    { id: '2', name: 'Ben' },
  ];
  const familyId = 'family-1';
  const currentUserId = '1';
  const currentProfileId = '1';

  it('renders filter buttons', () => {
    render(
      <TodoList
        familyId={familyId}
        currentUserId={currentUserId}
        currentProfileId={currentProfileId}
        users={users}
      />
    );
    expect(screen.getByText(/open/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
    expect(screen.getByText(/all/i)).toBeInTheDocument();
  });

  // Add more tests for loading, error, and todo rendering as needed
});
