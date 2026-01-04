import { supabase } from './supabaseClient';
import type { ShoppingItem, ShoppingPurchase, ShoppingPurchaseItem } from './types';

/**
 * Get all active shopping items for a family
 */
export async function getShoppingItems(familyId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ShoppingItem[]) || [];
}

/**
 * Add a new shopping item
 */
export async function addShoppingItem(
  familyId: string,
  name: string,
  quantity: string,
  unit: string,
  createdById: string
): Promise<void> {
  const { error } = await supabase.from('shopping_items').insert({
    family_id: familyId,
    name,
    quantity,
    unit,
    created_by_id: createdById,
  });

  if (error) throw error;
}

/**
 * Update quantity of an existing shopping item
 */
export async function updateShoppingItemQuantity(id: string, newQuantity: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .update({ quantity: newQuantity })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete a shopping item
 */
export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);

  if (error) throw error;
}

/**
 * Create a purchase record from selected items
 */
export async function createPurchase(
  familyId: string,
  purchasedById: string,
  items: ShoppingItem[]
): Promise<void> {
  // Create the purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('shopping_purchases')
    .insert({
      family_id: familyId,
      purchased_by_id: purchasedById,
      purchased_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // Create purchase items
  const purchaseItems = items.map((item) => ({
    purchase_id: (purchase as any).id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
  }));

  const { error: itemsError } = await supabase
    .from('shopping_purchase_items')
    .insert(purchaseItems);

  if (itemsError) throw itemsError;

  // Delete the original shopping items
  const itemIds = items.map((item) => item.id);
  const { error: deleteError } = await supabase.from('shopping_items').delete().in('id', itemIds);

  if (deleteError) throw deleteError;
}

/**
 * Get purchase history for a family
 */
export async function getPurchaseHistory(familyId: string): Promise<ShoppingPurchase[]> {
  const { data: purchases, error: purchasesError } = await supabase
    .from('shopping_purchases')
    .select('*')
    .eq('family_id', familyId)
    .order('purchased_at', { ascending: false })
    .limit(10);

  if (purchasesError) throw purchasesError;

  if (!purchases || purchases.length === 0) return [];

  // Fetch items for each purchase
  const purchaseIds = purchases.map((p: any) => p.id);
  const { data: items, error: itemsError } = await supabase
    .from('shopping_purchase_items')
    .select('*')
    .in('purchase_id', purchaseIds);

  if (itemsError) throw itemsError;

  // Group items by purchase
  const result: ShoppingPurchase[] = purchases.map((p: any) => ({
    id: p.id,
    family_id: p.family_id,
    purchased_at: p.purchased_at,
    purchased_by_id: p.purchased_by_id,
    items: (items || []).filter((i: any) => i.purchase_id === p.id) as ShoppingPurchaseItem[],
  }));

  return result;
}

/**
 * Get all unique items ever purchased (for quick-add feature)
 */
export async function getUniquePurchasedItems(familyId: string): Promise<
  Array<{
    name: string;
    quantity: string;
    unit: string;
  }>
> {
  // Get all purchases for the family
  const { data: purchases, error: purchasesError } = await supabase
    .from('shopping_purchases')
    .select('id')
    .eq('family_id', familyId);

  if (purchasesError) throw purchasesError;
  if (!purchases || purchases.length === 0) return [];

  const purchaseIds = purchases.map((p: any) => p.id);

  // Get all purchase items
  const { data: items, error: itemsError } = await supabase
    .from('shopping_purchase_items')
    .select('name, quantity, unit')
    .in('purchase_id', purchaseIds);

  if (itemsError) throw itemsError;
  if (!items) return [];

  // Create unique combinations of name/quantity/unit
  const uniqueMap = new Map<string, { name: string; quantity: string; unit: string }>();

  for (const item of items) {
    const key = `${item.name.toLowerCase()}|${item.quantity}|${item.unit}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }

  // Return sorted by name
  return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Delete multiple shopping items
 */
export async function deleteShoppingItems(ids: string[]): Promise<void> {
  const { error } = await supabase.from('shopping_items').delete().in('id', ids);

  if (error) throw error;
}
