import TodoList from './components/todos/TodoList';
import Login from './components/auth/Login';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, familyId, profileId, users, loadingProfile, handleLoginSuccess, handleLogout } =
    useAuth();

  return (
    <div className="p-4 max-w-sm mx-auto">
      {!user && <Login onLoginSuccess={handleLoginSuccess} />}

      {user && loadingProfile && <p>Lade Familien-Daten...</p>}

      {user && !loadingProfile && familyId && profileId && users.length > 0 && (
        <>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded mb-4 w-full"
          >
            Logout
          </button>
          <TodoList
            familyId={familyId}
            currentUserId={user.id}
            currentProfileId={profileId}
            users={users}
          />
        </>
      )}
    </div>
  );
}
