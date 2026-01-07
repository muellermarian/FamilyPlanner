import DashboardHeader from './DashboardHeader';
import DashboardTiles, { type DashboardTile } from './DashboardTiles';
import { useDashboardData } from './useDashboardData';
import { PullToRefresh } from '../shared/PullToRefresh';

interface DashboardProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
  onOpenTodos: () => void;
  onOpenNotes?: () => void;
  onOpenShopping?: () => void;
  onOpenRecipes?: () => void;
  onOpenContacts?: () => void;
  onOpenCalendar?: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Dashboard({
  familyId,
  currentUserId,
  currentProfileId,
  users,
  onOpenTodos,
  onOpenNotes,
  onOpenShopping,
  onOpenRecipes,
  onOpenContacts,
  onOpenCalendar,
  userEmail,
  onLogout,
}: DashboardProps) {
  const { openCount, noteCount, todayEventsCount, loading, familyName, refetch } =
    useDashboardData(familyId);
  const profileName = users.find((u) => u.id === currentProfileId)?.name ?? null;

  const tiles: DashboardTile[] = [
    {
      key: 'todos',
      emoji: '📝',
      label: 'Todos',
      subtitle: loading ? 'Lädt…' : openCount != null ? `${openCount} offen` : '—',
      onClick: onOpenTodos,
    },
    {
      key: 'calendar',
      emoji: '📅',
      label: 'Kalender',
      subtitle: loading ? 'Lädt…' : todayEventsCount != null ? `${todayEventsCount} heute` : '—',
      onClick: onOpenCalendar,
    },
    {
      key: 'groceries',
      emoji: '🛒',
      label: 'Einkaufsliste',
      subtitle: '',
      onClick: onOpenShopping,
    },
    {
      key: 'recipes',
      emoji: '🍳',
      label: 'Rezepte',
      subtitle: '',
      onClick: onOpenRecipes,
    },
    {
      key: 'notes',
      emoji: '🗒️',
      label: 'Notizen',
      subtitle: loading ? 'Lädt…' : noteCount != null ? `${noteCount} Notizen` : '—',
      onClick: onOpenNotes,
    },
    {
      key: 'contacts',
      emoji: '👥',
      label: 'Kontakte',
      subtitle: '',
      onClick: onOpenContacts,
    },
  ];

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative">
        <DashboardHeader
          familyName={familyName}
          profileName={profileName}
          userEmail={userEmail}
          currentUserId={currentUserId}
          currentProfileId={currentProfileId}
          familyId={familyId}
          onLogout={onLogout}
        />
        <DashboardTiles tiles={tiles} />
      </div>
    </PullToRefresh>
  );
}
