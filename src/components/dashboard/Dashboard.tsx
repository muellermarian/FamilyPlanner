import DashboardHeader from './DashboardHeader';
import DashboardTiles, { type DashboardTile } from './DashboardTiles';
import { useDashboardData } from './useDashboardData';

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
  const { openCount, noteCount, loading, familyName } = useDashboardData(familyId);
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
      subtitle: '',
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
    <div className="p-2 relative">
      <DashboardHeader
        familyName={familyName}
        profileName={profileName}
        userEmail={userEmail}
        currentProfileId={currentProfileId}
        familyId={familyId}
        onLogout={onLogout}
      />
      <DashboardTiles tiles={tiles} />
    </div>
  );
}
