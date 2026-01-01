/**
 * Dashboard component
 *
 * Renders a simple tile-based dashboard for a family. Current tiles include:
 * - Todos: shows the number of open todos and opens the Todos view
 * - Calendar, Groceries, Notes: placeholders for future features
 *
 * Behavior notes:
 * - Fetches the family's display name for the heading from the `families` table.
 * - Fetches the open todos count using `getTodosForFamily(familyId, 'open')`.
 * - Shows a compact settings menu with profile name, email, and logout action.
 */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getTodosForFamily } from '../lib/todos';

/**
 * Props for the Dashboard component.
 *
 * - familyId: UUID of the current family
 * - currentUserId/currentProfileId: IDs for the authenticated user and profile
 * - users: list of users (id + name) in the family, used to resolve the profile name
 * - onOpenTodos: callback invoked when the Todos tile is clicked
 * - userEmail: optional email address displayed in the settings menu
 * - onLogout: optional callback executed when the user chooses to logout
 */
interface DashboardProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
  onOpenTodos: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Dashboard({
  familyId,
  currentUserId,
  currentProfileId,
  users,
  onOpenTodos,
  userEmail,
  onLogout,
}: DashboardProps) {
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);
  // Derive the profile display name from the available profiles using currentProfileId
  const profileName = users.find((u) => u.id === currentProfileId)?.name ?? null;
  useEffect(() => {
    // Use a 'mounted' guard to avoid calling setState on an unmounted component.
    // Async fetches can resolve after the component unmounts and cause React warnings;
    // the guard prevents those updates.
    let mounted = true;
    // Main load routine: fetch the count of open todos (used in the Todos tile)
    const load = async () => {
      setLoading(true);
      try {
        const todos = await getTodosForFamily(familyId, 'open');
        if (!mounted) return;
        setOpenCount(todos.length);
      } catch (err) {
        if (!mounted) return;
        setOpenCount(null);
        console.error('Failed to load open todos', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    // Load the family's display name to show in the page heading.
    // This is a best-effort fetch — failure is non-fatal and we fall back to a placeholder.
    (async () => {
      try {
        const { data } = await supabase
          .from('families')
          .select('name')
          .eq('id', familyId)
          .maybeSingle();
        setFamilyName((data as any)?.name ?? null);
      } catch (err) {
        console.warn('Failed to load family name', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [familyId]);

  // Dashboard tiles to render. Each tile provides an emoji, label, subtitle and action.
  // The 'Todos' tile displays the number of open todos or a loading state.
  const tiles = [
    {
      key: 'todos',
      emoji: '📝',
      label: 'Todos',
      subtitle: loading ? 'Loading…' : openCount != null ? `${openCount} offen` : '—',
      onClick: onOpenTodos,
    },
    { key: 'calendar', emoji: '📅', label: 'Calendar', subtitle: 'Coming soon', onClick: () => {} },
    {
      key: 'groceries',
      emoji: '🛒',
      label: 'Groceries',
      subtitle: 'Coming soon',
      onClick: () => {},
    },
    { key: 'notes', emoji: '🗒️', label: 'Notes', subtitle: 'Coming soon', onClick: () => {} },
  ];

  return (
    <div className="p-2 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">Familie</div>
          <h1 className="text-2xl font-bold">{familyName ?? '—'}</h1>
        </div>

        {/* Settings menu: toggled by the cog button. Shows profile name, email, and a logout action.
            We prevent the default onMouseDown to avoid blurring the button which can cause the
            menu to close immediately in some browsers or assistive tech. */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Open settings"
            className="p-2 rounded hover:bg-gray-100"
            onMouseDown={(e) => e.preventDefault()}
          >
            ⚙️
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-3 text-sm z-10">
              <div className="font-medium mb-0">{profileName ?? 'Unknown'}</div>
              <div className="text-xs text-gray-500 mb-2">{userEmail ?? '—'}</div>

              <div className="border-t pt-2 mt-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            className="flex flex-col items-center justify-center p-6 bg-white rounded shadow text-center h-36"
          >
            <div className="text-4xl mb-2">{t.emoji}</div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-sm text-gray-500">{t.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
