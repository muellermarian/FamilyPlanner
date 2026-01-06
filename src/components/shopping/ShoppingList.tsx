import { useState, useEffect } from 'react';
import type { ShoppingPurchase } from '../../lib/types';
import { addShoppingItem, createPurchase, getPurchaseHistory } from '../../lib/shopping';
import { useToast } from '../../hooks/useToast';
import { useShoppingItems } from './useShoppingItems';
import { useShoppingSelection } from './useShoppingSelection';
import { sortShoppingItems } from './shoppingUtils';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';
import ShoppingItemComponent from './ShoppingItem';
import ShoppingAddForm from './ShoppingAddForm';
import ShoppingHistory from './ShoppingHistory';
import ShoppingQuickAdd from './ShoppingQuickAdd';

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
  const { items, loading, error, fetchItems, handleDelete, handleDeleteSelected, updateQuantity } =
    useShoppingItems(familyId);
  const { selectedIds, handleToggleSelect, handleToggleAll, clearSelection, removeFromSelection } =
    useShoppingSelection();
  const { toast, showToast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [purchases, setPurchases] = useState<ShoppingPurchase[]>([]);

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

  const handleAdd = async (
    name: string,
    quantity: string,
    unit: string,
    store?: string | null,
    dealDate?: string | null
  ) => {
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
        await updateQuantity(existingItem.id, combinedQty.toString());
        setShowAddForm(false);

        // Show toast message
        showToast(
          `Menge von "${name}" wurde von ${existingItem.quantity} auf ${combinedQty} ${unit} erhöht`
        );
      } else {
        await addShoppingItem(
          familyId,
          name,
          quantity,
          unit,
          currentProfileId || currentUserId,
          store,
          dealDate
        );
        await fetchItems();
        setShowAddForm(false);
      }
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
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
      clearSelection();
      await fetchItems();
      await fetchHistory();
      showToast(`${selectedItems.length} Artikel eingekauft ✓`);
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDeleteSelectedItems = async () => {
    const success = await handleDeleteSelected(selectedIds);
    if (success) {
      clearSelection();
    }
  };

  const handleDeleteItem = async (id: string) => {
    await handleDelete(id);
    removeFromSelection(id);
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const sortedItems = sortShoppingItems(items);

  const handleRefresh = async () => {
    await fetchItems();
    await fetchHistory();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        {showQuickAdd && (
          <ShoppingQuickAdd
            familyId={familyId}
            currentProfileId={currentProfileId}
            currentItems={items}
            onClose={() => setShowQuickAdd(false)}
            onItemsAdded={fetchItems}
          />
        )}

        {showHistory && (
          <ShoppingHistory
            purchases={purchases}
            users={users}
            onClose={() => setShowHistory(false)}
          />
        )}

        {!showQuickAdd && !showHistory && (
          <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Einkaufsliste</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  title="Schnellanlage"
                >
                  ⚡
                </button>
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

            {showAddForm && (
              <ShoppingAddForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
            )}

            <div className="mb-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleAll(items.map((item) => item.id))}
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
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedItems}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Markierte löschen ({selectedIds.size})
                </button>
              )}
            </div>

            <div className="mb-2 text-sm text-gray-600">
              {loading ? '🔄 Lade Artikel…' : `${items.length} Artikel`}
            </div>
            {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}

            <ul className="flex flex-col gap-2">
              {sortedItems.map((item) => (
                <ShoppingItemComponent
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={handleToggleSelect}
                  onDelete={handleDeleteItem}
                />
              ))}
            </ul>

            {toast && <Toast message={toast} />}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
