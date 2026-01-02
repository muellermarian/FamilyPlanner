import { useState } from 'react';
import { TodoList } from './components/todos';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import NoteList from './components/notes/NoteList';
import ShoppingList from './components/shopping/ShoppingList';
import RecipeList from './components/recipes/RecipeList';
import ContactList from './components/contacts/ContactList';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, familyId, profileId, users, loadingProfile, handleLoginSuccess, handleLogout } =
    useAuth();
  const [view, setView] = useState<
    'dashboard' | 'todos' | 'notes' | 'shopping' | 'recipes' | 'contacts'
  >('dashboard');

  return (
    <div className="p-4 max-w-sm mx-auto">
      {!user && <Login onLoginSuccess={handleLoginSuccess} />}

      {user && loadingProfile && <p>Loading family data...</p>}

      {user && !loadingProfile && familyId && profileId && users.length > 0 && (
        <>
          <div className="mb-4">
            {(view === 'todos' ||
              view === 'notes' ||
              view === 'shopping' ||
              view === 'recipes' ||
              view === 'contacts') && (
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
              onOpenNotes={() => setView('notes')}
              onOpenShopping={() => setView('shopping')}
              onOpenRecipes={() => setView('recipes')}
              onOpenContacts={() => setView('contacts')}
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

          {view === 'notes' && (
            <NoteList familyId={familyId} currentProfileId={profileId} users={users} />
          )}

          {view === 'shopping' && (
            <ShoppingList
              familyId={familyId}
              currentUserId={user.id}
              currentProfileId={profileId}
              users={users}
            />
          )}

          {view === 'recipes' && (
            <RecipeList familyId={familyId} currentUserId={user.id} currentProfileId={profileId} />
          )}

          {view === 'contacts' && <ContactList familyId={familyId} />}
        </>
      )}
    </div>
  );
}
