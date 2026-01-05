import { useState, useEffect } from 'react';
import type { Recipe, RecipeIngredient } from '../../lib/types';
import { addShoppingItem, getShoppingItems, updateShoppingItemQuantity } from '../../lib/shopping';
import { markRecipeForCooking, markRecipeAsCooked } from '../../lib/recipes';

interface RecipeDetailProps {
  recipe: Recipe;
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  isMarkedForCooking: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit: () => void;
  onAddToShopping?: (message: string) => void;
}

export default function RecipeDetail({
  recipe,
  familyId,
  currentUserId,
  currentProfileId,
  isMarkedForCooking,
  onClose,
  onUpdate,
  onEdit,
  onAddToShopping,
}: RecipeDetailProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [desiredServings, setDesiredServings] = useState<number>(recipe.servings || 1);

  // Initialize selected ingredients based on add_to_shopping flag
  useEffect(() => {
    const selected = new Set<string>();
    recipe.ingredients?.forEach((ing) => {
      if (ing.add_to_shopping) {
        selected.add(ing.id);
      }
    });
    setSelectedIngredients(selected);
  }, [recipe]);

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIngredients.size === (recipe.ingredients?.length || 0)) {
      setSelectedIngredients(new Set());
    } else {
      const allIds = new Set(recipe.ingredients?.map((ing) => ing.id) || []);
      setSelectedIngredients(allIds);
    }
  };

  const handleAddToShopping = async () => {
    if (selectedIngredients.size === 0) {
      alert('Bitte wähle mindestens eine Zutat aus');
      return;
    }

    const ingredientsToAdd =
      recipe.ingredients?.filter((ing) => selectedIngredients.has(ing.id)) || [];

    // Scale ingredients if recipe has servings info
    let scaledIngredients = ingredientsToAdd;
    if (recipe.servings) {
      const baseServings = recipe.servings || 1;
      const scaleFactor = desiredServings / baseServings;
      scaledIngredients = ingredientsToAdd.map((ing) => ({
        ...ing,
        quantity: (parseFloat(ing.quantity) * scaleFactor).toString(),
      }));
    }

    await addIngredientsToShopping(scaledIngredients);
  };

  const addIngredientsToShopping = async (ingredientsToAdd: RecipeIngredient[]) => {
    setAdding(true);
    try {
      // Get existing shopping items
      const existingItems = await getShoppingItems(familyId);

      let addedCount = 0;
      let updatedCount = 0;

      // Add each ingredient to shopping list (or update quantity)
      for (const ing of ingredientsToAdd) {
        // Check if item with same name and unit already exists
        const existingItem = existingItems.find(
          (item) => item.name.toLowerCase() === ing.name.toLowerCase() && item.unit === ing.unit
        );

        if (existingItem) {
          // Parse quantities and add them
          const existingQty = parseFloat(existingItem.quantity) || 0;
          const newQty = parseFloat(ing.quantity) || 0;
          const combinedQty = existingQty + newQty;

          // Update the existing item
          await updateShoppingItemQuantity(existingItem.id, combinedQty.toFixed(2));
          updatedCount++;
        } else {
          // Add new item
          const quantity = parseFloat(ing.quantity) || 0;
          await addShoppingItem(
            familyId,
            ing.name,
            quantity.toFixed(2),
            ing.unit,
            currentProfileId || currentUserId
          );
          addedCount++;
        }
      }

      // Mark recipe for cooking
      await markRecipeForCooking(recipe.id, familyId, currentProfileId || currentUserId);

      const message =
        updatedCount > 0
          ? `${addedCount} neue und ${updatedCount} aktualisierte Zutat(en) zur Einkaufsliste hinzugefügt! "${recipe.name}" ist jetzt zum Kochen markiert.`
          : `${addedCount} Zutat(en) zur Einkaufsliste hinzugefügt! "${recipe.name}" ist jetzt zum Kochen markiert.`;

      // Callback für Toast-Message
      if (onAddToShopping) {
        onAddToShopping(message);
      }
      
      // Sofort schließen und aktualisieren
      onClose();
      onUpdate();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    } finally {
      setAdding(false);
    }
  };

  const handleMarkAsCooked = async () => {
    try {
      await markRecipeAsCooked(recipe.id, familyId, currentProfileId || currentUserId);
      
      if (onAddToShopping) {
        onAddToShopping(`"${recipe.name}" wurde als gekocht markiert!`);
      }
      
      onClose();
      onUpdate();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const allSelected =
    recipe.ingredients && recipe.ingredients.length > 0
      ? selectedIngredients.size === recipe.ingredients.length
      : false;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">{recipe.name}</h3>
            <div className="flex gap-2 items-center">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                title="Bearbeiten"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            {recipe.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {isMarkedForCooking && (
              <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium text-orange-800">Zum Kochen markiert</div>
                  <div className="text-sm text-orange-600">
                    Zutaten wurden zur Einkaufsliste hinzugefügt
                  </div>
                </div>
                <button
                  onClick={handleMarkAsCooked}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                >
                  Gekocht ✓
                </button>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Zutaten ({recipe.ingredients?.length || 0})</h4>
                <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-700">
                  {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
              </div>

              {!recipe.ingredients || recipe.ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm">Keine Zutaten vorhanden</p>
              ) : (
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-center gap-3 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.has(ing.id)}
                        onChange={() => toggleIngredient(ing.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {recipe.instructions && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Anleitung</h4>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                  {recipe.instructions}
                </div>
              </div>
            )}

            {recipe.servings && !isMarkedForCooking && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <label className="block text-sm font-medium text-blue-900 mb-3">
                  Für wie viele Personen möchtest du kochen?
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={desiredServings}
                    onChange={(e) => setDesiredServings(parseFloat(e.target.value) || 1)}
                    className="flex-1 border border-blue-300 rounded px-3 py-2"
                  />
                  <div className="text-sm text-blue-700 font-medium whitespace-nowrap">
                    Multiplikator: {((desiredServings || 1) / (recipe.servings || 1)).toFixed(2)}x
                  </div>
                </div>
                {desiredServings !== recipe.servings && (
                  <div className="mt-3 p-2 bg-white rounded border border-blue-100">
                    <h5 className="font-medium text-sm text-blue-900 mb-2">Angepasste Mengen:</h5>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {recipe.ingredients?.map((ing) => {
                        const scaleFactor = (desiredServings || 1) / (recipe.servings || 1);
                        const scaledQty = (parseFloat(ing.quantity) * scaleFactor).toFixed(2);
                        return (
                          <div key={ing.id} className="text-xs text-blue-700 flex justify-between">
                            <span>{ing.name}</span>
                            <span className="font-medium">
                              {scaledQty} {ing.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isMarkedForCooking && (
            <div className="p-4 border-t">
              <button
                onClick={handleAddToShopping}
                disabled={adding || selectedIngredients.size === 0}
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {adding ? 'Wird hinzugefügt...' : 'Kochen - Zutaten zur Einkaufsliste'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
