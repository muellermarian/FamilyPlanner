import { useEffect, useState } from 'react';
import type { ShoppingItem, ShoppingPurchase } from '../../lib/types';
import {
  getShoppingItems,
  addShoppingItem,
  deleteShoppingItem,
  createPurchase,
  getPurchaseHistory,
  updateShoppingItemQuantity,
} from '../../lib/shopping';
import ShoppingItemComponent from './ShoppingItem';
import ShoppingAddForm from './ShoppingAddForm';
import ShoppingHistory from './ShoppingHistory';

interface ShoppingListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

export default function ShoppingList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<ShoppingPurchase[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShoppingItems(familyId);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || String(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getPurchaseHistory(familyId);
      setPurchases(data);
    } catch (err) {
      // Silent fail for purchase history
    }
  };

  useEffect(() => {
    fetchItems();
    fetchHistory();
  }, [familyId]);

  const handleAdd = async (name: string, quantity: string, unit: string) => {
    try {
      // Check if item with same name and unit already exists
      const existingItem = items.find(
        (item) => item.name.toLowerCase() === name.toLowerCase() && item.unit === unit
      );

      if (existingItem) {
        // Parse quantities and add them
        const existingQty = parseFloat(existingItem.quantity) || 0;
        const newQty = parseFloat(quantity) || 0;
        const combinedQty = existingQty + newQty;

        // Update the existing item
        await updateShoppingItemQuantity(existingItem.id, combinedQty.toString());
        await fetchItems();
        setShowAddForm(false);

        // Show toast message
        setToast(
          `Menge von "${name}" wurde von ${existingItem.quantity} auf ${combinedQty} ${unit} erhöht`
        );
        setTimeout(() => setToast(null), 4000);
      } else {
        // Add new item
        await addShoppingItem(familyId, name, quantity, unit, currentProfileId || currentUserId);
        await fetchItems();
        setShowAddForm(false);
      }
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShoppingItem(id);
      await fetchItems();
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const handlePurchase = async () => {
    if (selectedIds.size === 0) {
      alert('Bitte wähle mindestens einen Artikel aus');
      return;
    }

    const selectedItems = items.filter((item) => selectedIds.has(item.id));

    try {
      await createPurchase(familyId, currentProfileId || currentUserId, selectedItems);
      setSelectedIds(new Set());
      await fetchItems();
      await fetchHistory();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Einkaufsliste</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            title="Historie anzeigen"
          >
            📜
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
            >
              +
            </button>
          )}
        </div>
      </div>

      {showAddForm && <ShoppingAddForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />}

      <div className="mb-4 flex gap-2">
        <button
          onClick={handleToggleAll}
          className="px-3 py-2 border rounded hover:bg-gray-100 text-sm"
        >
          {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
        </button>
        <button
          onClick={handlePurchase}
          disabled={selectedIds.size === 0}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Markierte eingekauft ({selectedIds.size})
        </button>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        {loading ? '🔄 Lade Artikel…' : `${items.length} Artikel`}
      </div>
      {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}

      <ul className="flex flex-col gap-2">
        {items
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item) => (
            <ShoppingItemComponent
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={handleToggleSelect}
              onDelete={handleDelete}
            />
          ))}
      </ul>

      {items.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Keine Artikel auf der Liste. Klicke auf + um einen hinzuzufügen.
        </div>
      )}

      {showHistory && (
        <ShoppingHistory
          purchases={purchases}
          users={users}
          onClose={() => setShowHistory(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
