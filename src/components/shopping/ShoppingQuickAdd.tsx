import { useEffect, useState } from 'react';
import {
  getUniquePurchasedItems,
  addShoppingItem,
  updateShoppingItemQuantity,
} from '../../lib/shopping';
import type { ShoppingItem } from '../../lib/types';

interface QuickAddItem {
  name: string;
  quantity: string;
  unit: string;
  isSelected: boolean;
}

interface ShoppingQuickAddProps {
  familyId: string;
  currentProfileId: string;
  currentItems: ShoppingItem[];
  onClose: () => void;
  onItemsAdded: () => void;
}

export default function ShoppingQuickAdd({
  familyId,
  currentProfileId,
  currentItems,
  onClose,
  onItemsAdded,
}: ShoppingQuickAddProps) {
  const [items, setItems] = useState<QuickAddItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItems();
  }, [familyId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getUniquePurchasedItems(familyId);
      setItems(data.map((item) => ({ ...item, isSelected: false })));
    } catch (err) {
      console.error('Fehler beim Laden der Artikel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredItems();
    const allSelected = filtered.every((item) => item.isSelected);

    setItems((prev) =>
      prev.map((item) => {
        if (filtered.includes(item)) {
          return { ...item, isSelected: !allSelected };
        }
        return item;
      })
    );
  };

  const handleDeselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isSelected: false })));
  };

  const handleAddToList = async () => {
    const selectedItems = items.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      alert('Bitte wähle mindestens einen Artikel aus');
      return;
    }

    setLoading(true);
    try {
      for (const item of selectedItems) {
        // Check if item already exists
        const existingItem = currentItems.find(
          (ci) => ci.name.toLowerCase() === item.name.toLowerCase() && ci.unit === item.unit
        );

        if (existingItem) {
          // Update quantity
          const existingQty = parseFloat(existingItem.quantity) || 0;
          const newQty = parseFloat(item.quantity) || 0;
          const combinedQty = existingQty + newQty;
          await updateShoppingItemQuantity(existingItem.id, combinedQty.toString());
        } else {
          // Add new item
          await addShoppingItem(familyId, item.name, item.quantity, item.unit, currentProfileId);
        }
      }

      onItemsAdded();
      onClose();
    } catch (err: any) {
      alert('Fehler beim Hinzufügen: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  };

  const filteredItems = getFilteredItems();
  const selectedCount = items.filter((item) => item.isSelected).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">Schnellanlage</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Artikel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b flex gap-2 flex-wrap">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            Alle {filteredItems.length > 0 && `(${filteredItems.length})`} markieren/entmarkieren
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            Alle abwählen
          </button>
          <button
            onClick={handleAddToList}
            disabled={selectedCount === 0 || loading}
            className="ml-auto bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCount > 0
              ? `${selectedCount} Artikel auf die Einkaufsliste`
              : 'Artikel auswählen'}
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <div className="text-center text-gray-500">Lade...</div>}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? 'Keine Artikel gefunden' : 'Noch keine Artikel eingekauft'}
            </div>
          )}

          {!loading && filteredItems.length > 0 && (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const originalIndex = items.indexOf(item);
                return (
                  <label
                    key={`${item.name}-${item.quantity}-${item.unit}`}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      item.isSelected ? 'bg-green-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isSelected}
                      onChange={() => handleToggleItem(originalIndex)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with count */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          {filteredItems.length} Artikel verfügbar · {selectedCount} ausgewählt
        </div>
      </div>
    </div>
  );
}
