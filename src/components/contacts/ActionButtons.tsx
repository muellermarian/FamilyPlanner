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
    <div className="flex gap-2 mb-4 pb-3 border-b">
      {/* Button to add a person, shown only if onAddPerson is provided */}
      {onAddPerson && (
        <button
          onClick={onAddPerson}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-sm font-medium"
          title="Add person"
        >
          👤+
        </button>
      )}
      {/* Button to edit the item */}
      <button
        onClick={onEdit}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-sm font-medium"
        title="Edit"
      >
        📝
      </button>
      {/* Button to delete the item */}
      <button
        onClick={onDelete}
        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded text-sm font-medium"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );
}
