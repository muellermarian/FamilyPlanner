interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onAddPerson?: () => void;
}

export default function ActionButtons({ onEdit, onDelete, onAddPerson }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 mb-4 pb-3 border-b">
      {onAddPerson && (
        <button
          onClick={onAddPerson}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-sm font-medium"
          title="Person hinzufügen"
        >
          👤+
        </button>
      )}
      <button
        onClick={onEdit}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-sm font-medium"
        title="Bearbeiten"
      >
        📝
      </button>
      <button
        onClick={onDelete}
        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded text-sm font-medium"
        title="Löschen"
      >
        🗑️
      </button>
    </div>
  );
}
