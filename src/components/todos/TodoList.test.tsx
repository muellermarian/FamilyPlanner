import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';

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
    expect(screen.getByText(/offene todos/i)).toBeInTheDocument();
    expect(screen.getByText(/erledigt/i)).toBeInTheDocument();
    expect(screen.getByText(/alle/i)).toBeInTheDocument();
  });
});
