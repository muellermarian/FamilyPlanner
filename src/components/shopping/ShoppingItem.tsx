import { useState } from 'react';
import type { ShoppingItem } from '../../lib/types';

interface ShoppingItemProps {
  item: ShoppingItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ShoppingItemComponent({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
}: ShoppingItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <li className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow relative">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="w-5 h-5"
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">
            {item.quantity} {item.unit}
          </div>
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
        <button
          onClick={handleDeleteClick}
          className="text-red-600 hover:text-red-800 px-2 py-1 font-bold"
          title="Löschen"
        >
          X
        </button>
      </li>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-3">Artikel löschen?</h3>
            <p className="text-gray-600 mb-4">
              Möchtest du &quot;{item.name}&quot; wirklich von der Einkaufsliste entfernen?
            </p>
            <div className="flex gap-3">
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
