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

export default function DashboardTiles({ tiles }: DashboardTilesProps) {
  return (
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
  );
}

export type { DashboardTile };
