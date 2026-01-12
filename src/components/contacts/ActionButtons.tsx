// Props for the ActionButtons component
interface ActionButtonsProps {
  onEdit: () => void; // Callback for edit action
  onDelete: () => void; // Callback for delete action
  onAddPerson?: () => void; // Optional callback for adding a person
}

type ReadonlyActionButtonsProps = Readonly<ActionButtonsProps>;

export default function ActionButtons({
  onEdit,
  onDelete,
  onAddPerson,
}: ReadonlyActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2 w-full">
      {onAddPerson && (
        <button
          onClick={onAddPerson}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2"
          title="Person hinzufügen"
        >
          <span>👤+</span>
          <span>Person hinzufügen</span>
        </button>
      )}
      <button
        onClick={onEdit}
        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
        title="Bearbeiten"
      >
        <span>📝</span>
        <span>Bearbeiten</span>
      </button>
      <button
        onClick={onDelete}
        className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm font-medium flex items-center justify-center gap-2 border border-red-200"
        title="Löschen"
      >
        <span>🗑️</span>
        <span>Löschen</span>
      </button>
    </div>
  );
}
