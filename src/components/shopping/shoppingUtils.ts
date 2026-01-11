import type { ShoppingItem } from '../../lib/types';

function hasDeal(item: ShoppingItem): boolean {
  return Boolean(item.deal_date || item.store);
}

function compareDeal(a: ShoppingItem, b: ShoppingItem): number {
  const aHasDeal = hasDeal(a);
  const bHasDeal = hasDeal(b);
  if (aHasDeal && !bHasDeal) return -1;
  if (!aHasDeal && bHasDeal) return 1;
  return 0;
}

function compareDate(a: ShoppingItem, b: ShoppingItem): number {
  if (a.deal_date && b.deal_date) {
    return a.deal_date.localeCompare(b.deal_date);
  }
  if (a.deal_date && !b.deal_date) return -1;
  if (!a.deal_date && b.deal_date) return 1;
  return 0;
}

function compareStore(a: ShoppingItem, b: ShoppingItem): number {
  if (a.store && b.store) {
    return a.store.localeCompare(b.store);
  }
  return 0;
}

export function sortShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    // Items with deal_date and/or store come first
    const dealCompare = compareDeal(a, b);
    if (dealCompare !== 0) return dealCompare;

    // Both have deals: sort by date, then by store
    if (hasDeal(a) && hasDeal(b)) {
      const dateCompare = compareDate(a, b);
      if (dateCompare !== 0) return dateCompare;
      const storeCompare = compareStore(a, b);
      if (storeCompare !== 0) return storeCompare;
    }

    // Finally, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}
