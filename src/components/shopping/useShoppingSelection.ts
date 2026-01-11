// Custom hook for managing selection state of shopping items
import { useState } from 'react';

export function useShoppingSelection() {
  // State for selected item IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toggle selection for a single item
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

  // Toggle selection for all items
  const handleToggleAll = (allItemIds: string[]) => {
    if (selectedIds.size === allItemIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allItemIds));
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Remove a single item from selection
  const removeFromSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Return selection state and handlers
  return {
    selectedIds,
    handleToggleSelect,
    handleToggleAll,
    clearSelection,
    removeFromSelection,
  };
}
