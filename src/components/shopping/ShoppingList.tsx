// Props for the ShoppingList component: family/user info and user list
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

type ReadonlyShoppingListProps = Readonly<ShoppingListProps>;

// ShoppingList component manages the shopping list UI and logic
export default function ShoppingList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: ReadonlyShoppingListProps) {
  // Custom hooks for shopping items, selection, and toast
  const { items, loading, error, fetchItems, handleDelete, handleDeleteSelected, updateQuantity } =
    useShoppingItems(familyId);
  const { selectedIds, handleToggleSelect, handleToggleAll, clearSelection, removeFromSelection } =
    useShoppingSelection();
  const { toast, showToast } = useToast();

  // State for showing forms and history
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [purchases, setPurchases] = useState<ShoppingPurchase[]>([]);

  // Fetch purchase history from backend
  const fetchHistory = async () => {
    try {
      const data = await getPurchaseHistory(familyId);
      setPurchases(data);
    } catch (err) {
      console.error('Fehler beim Laden der Einkaufshistorie:', err);
    }
  };

  // Fetch items and history when familyId changes
  useEffect(() => {
    fetchItems();
    fetchHistory();
  }, [familyId]);

  // Handler for adding a new shopping item
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
        const existingQty = Number.parseFloat(existingItem.quantity) || 0;
        const newQty = Number.parseFloat(quantity) || 0;
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

  // Handler for marking selected items as purchased
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

  // Handler for deleting selected items
  const handleDeleteSelectedItems = async () => {
    const success = await handleDeleteSelected(selectedIds);
    if (success) {
      clearSelection();
    }
  };

  // Handler for deleting a single item
  const handleDeleteItem = async (id: string) => {
    await handleDelete(id);
    removeFromSelection(id);
  };

  // Determine if all items are selected
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  // Sort items for display
  const sortedItems = sortShoppingItems(items);

  // Handler for refreshing items and history
  const handleRefresh = async () => {
    await fetchItems();
    await fetchHistory();
  };

  return (
    // Pull-to-refresh wrapper for mobile usability
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        {/* Quick add form for fast item entry */}
        {showQuickAdd && (
          <ShoppingQuickAdd
            familyId={familyId}
            currentProfileId={currentProfileId}
            currentItems={items}
            onClose={() => setShowQuickAdd(false)}
            onItemsAdded={fetchItems}
          />
        )}

        {/* Shopping history view */}
        {showHistory && (
          <ShoppingHistory
            purchases={purchases}
            users={users}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Main shopping list UI */}
        {!showQuickAdd && !showHistory && (
          <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
            <div className="flex justify-between items-center mb-4">
              {/* List title and action buttons */}
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

            {/* Add item form */}
            {showAddForm && (
              <ShoppingAddForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
            )}

            {/* Selection and purchase controls */}
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

            {/* Loading and error messages */}
            <div className="mb-2 text-sm text-gray-600">
              {loading ? '🔄 Lade Artikel…' : `${items.length} Artikel`}
            </div>
            {error && <div className="mb-2 text-red-600">Fehler: {error}</div>}

            {/* List of shopping items */}
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

            {/* Toast notification for feedback */}
            {toast && <Toast message={toast} />}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
