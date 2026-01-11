// Custom hook for managing shopping items state and actions
import { useState, useEffect } from 'react';
import type { ShoppingItem } from '../../lib/types';
import {
  getShoppingItems,
  deleteShoppingItem,
  deleteShoppingItems,
  updateShoppingItemQuantity,
} from '../../lib/shopping';

export function useShoppingItems(familyId: string) {
  // State for shopping items, loading, and error
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch shopping items from backend
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

  // Fetch items when familyId changes
  useEffect(() => {
    fetchItems();
  }, [familyId]);

  // Delete a single shopping item
  const handleDelete = async (id: string) => {
    try {
      await deleteShoppingItem(id);
      await fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete selected shopping items after confirmation
  const handleDeleteSelected = async (selectedIds: Set<string>) => {
    if (selectedIds.size === 0) {
      alert('Bitte wähle mindestens einen Artikel aus');
      return false;
    }

    const confirmed = confirm(
      `Möchtest du wirklich ${selectedIds.size} markierte${
        selectedIds.size === 1 ? 'n' : ''
      } Artikel löschen?`
    );

    if (!confirmed) return false;

    try {
      await deleteShoppingItems(Array.from(selectedIds));
      await fetchItems();
      return true;
    } catch (err: any) {
      alert('Fehler beim Löschen: ' + (err.message || String(err)));
      return false;
    }
  };

  // Update the quantity of a shopping item
  const updateQuantity = async (id: string, quantity: string) => {
    await updateShoppingItemQuantity(id, quantity);
    await fetchItems();
  };

  // Return state and handlers for shopping items
  return {
    items,
    loading,
    error,
    fetchItems,
    handleDelete,
    handleDeleteSelected,
    updateQuantity,
  };
}
