// Props for the ActionButtons component
interface ActionButtonsProps {
  onEdit: () => void; // Callback for edit action
  onDelete: () => void; // Callback for delete action
  onAddPerson?: () => void; // Optional callback for adding a person
  compact?: boolean; // Optional: kompakte Darstellung
}

type ReadonlyActionButtonsProps = Readonly<ActionButtonsProps>;

export default function ActionButtons({
  onEdit,
  onDelete,
  onAddPerson,
  compact = false,
}: ReadonlyActionButtonsProps & { compact?: boolean }) {
  // Kompakte Styles
  const btnBase = compact ? 'flex-1 px-2 py-1 text-xs' : 'flex-1 px-4 py-2 text-sm';
  const iconGap = compact ? 'gap-1' : 'gap-2';
  const labelHidden = compact ? 'hidden sm:inline' : '';
  return (
    <div className={`flex flex-row ${iconGap} w-full mb-2`}>
      {onAddPerson && (
        <button
          onClick={onAddPerson}
          className={`${btnBase} bg-green-600 text-white rounded hover:bg-green-700 font-medium flex items-center justify-center ${iconGap}`}
          title="Person hinzufügen"
        >
          <span>👤+</span>
          <span className={labelHidden}>Person hinzufügen</span>
        </button>
      )}
      <button
        onClick={onEdit}
        className={`${btnBase} bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center justify-center ${iconGap}`}
        title="Bearbeiten"
      >
        <span>📝</span>
        <span className={labelHidden}>Bearbeiten</span>
      </button>
      <button
        onClick={onDelete}
        className={`${btnBase} bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium flex items-center justify-center border border-red-200 ${iconGap}`}
        title="Löschen"
      >
        <span>🗑️</span>
        <span className={labelHidden}>Löschen</span>
      </button>
    </div>
  );
}
