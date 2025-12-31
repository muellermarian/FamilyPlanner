type FilterType = 'open' | 'all' | 'done';

interface TodoFilterProps {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
}

export default function TodoFilter({ filter, setFilter }: TodoFilterProps) {
  return (
    <div className="flex gap-2 mb-4">
      {(['open', 'all', 'done'] as FilterType[]).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {f === 'open' ? 'Offene Todos' : f === 'all' ? 'Alle' : 'Erledigt'}
        </button>
      ))}
    </div>
  );
}
