import { useState } from 'react';
import { TodoList } from './components/todos';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, familyId, profileId, users, loadingProfile, handleLoginSuccess, handleLogout } =
    useAuth();
  const [view, setView] = useState<'dashboard' | 'todos'>('dashboard');

  return (
    <div className="p-4 max-w-sm mx-auto">
      {!user && <Login onLoginSuccess={handleLoginSuccess} />}

      {user && loadingProfile && <p>Loading family data...</p>}

      {user && !loadingProfile && familyId && profileId && users.length > 0 && (
        <>
          <div className="mb-4">
            {view === 'todos' && (
              <button
                onClick={() => setView('dashboard')}
                className="w-full flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded shadow-sm hover:shadow focus:outline-none"
                aria-label="Zurück zum Dashboard"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">Home</span>
              </button>
            )}
          </div>

          {view === 'dashboard' && (
            <Dashboard
              familyId={familyId}
              currentUserId={user.id}
              currentProfileId={profileId}
              users={users}
              userEmail={user.email}
              onLogout={handleLogout}
              onOpenTodos={() => setView('todos')}
            />
          )}

          {view === 'todos' && (
            <TodoList
              familyId={familyId}
              currentUserId={user.id}
              currentProfileId={profileId}
              users={users}
            />
          )}
        </>
      )}
    </div>
  );
}
