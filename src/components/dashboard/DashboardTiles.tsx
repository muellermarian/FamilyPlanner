interface DashboardTile {
  key: string;
  emoji: string;
  label: string;
  subtitle: string;
  onClick?: () => void;
}

interface DashboardTilesProps {
  tiles: DashboardTile[];
}

const TILE_GRADIENTS: Record<string, string> = {
  todos: 'from-yellow-100 to-orange-100',
  calendar: 'from-blue-100 to-cyan-100',
  groceries: 'from-green-100 to-emerald-100',
  recipes: 'from-orange-100 to-red-100',
  notes: 'from-purple-100 to-pink-100',
  contacts: 'from-indigo-100 to-blue-100',
};

export default function DashboardTiles({ tiles }: DashboardTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((t) => (
        <button
          key={t.key}
          onClick={t.onClick}
          className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${
            TILE_GRADIENTS[t.key] || 'from-gray-100 to-gray-200'
          } rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-center h-36 border border-white/50`}
        >
          <div className="text-5xl mb-2">{t.emoji}</div>
          <div className="font-bold text-gray-800">{t.label}</div>
          <div className="text-xs text-gray-600 font-medium">{t.subtitle}</div>
        </button>
      ))}
    </div>
  );
}

export type { DashboardTile };
