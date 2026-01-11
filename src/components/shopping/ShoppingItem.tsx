// Props for the ShoppingItemComponent: item data, selection state, and handlers
import { useState } from 'react';
import type { ShoppingItem } from '../../lib/types';

interface ShoppingItemProps {
  item: ShoppingItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

type ReadonlyShoppingItemProps = Readonly<ShoppingItemProps>;

// ShoppingItemComponent displays a single shopping list item with controls
export default function ShoppingItemComponent({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
}: ReadonlyShoppingItemProps) {
  // State for showing delete confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);

  // Handler for delete button click
  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  // Handler to confirm deletion
  const confirmDelete = () => {
    onDelete(item.id);
    setShowConfirm(false);
  };

  // Handler to cancel deletion
  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Shopping list item UI */}
      <li className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow relative">
        {/* Checkbox to select item */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="w-5 h-5"
        />
        <div className="flex-1">
          {/* Item name */}
          <div className="font-medium">{item.name}</div>
          {/* Item quantity and unit */}
          <div className="text-sm text-gray-500">
            {item.quantity} {item.unit}
          </div>
          {/* Store and deal date info if available */}
          {(item.store || item.deal_date) && (
            <div className="text-sm text-blue-600 mt-1 flex items-center gap-2">
              {item.store && <span>🏪 {item.store}</span>}
              {item.deal_date && (
                <span>
                  📅{' '}
                  {new Date(item.deal_date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="text-red-600 hover:text-red-800 px-2 py-1 font-bold"
          title="Löschen"
        >
          X
        </button>
      </li>

      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-3">Artikel löschen?</h3>
            <p className="text-gray-600 mb-4">
              Möchtest du &quot;{item.name}&quot; wirklich von der Einkaufsliste entfernen?
            </p>
            <div className="flex gap-3">
              {/* Cancel and confirm delete buttons */}
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
