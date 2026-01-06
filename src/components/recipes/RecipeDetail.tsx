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
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-2xl"
          aria-label="Zurück"
        >
          ←
        </button>
        <h3 className="text-lg font-bold flex-1 truncate">{recipe.name}</h3>
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 text-xl"
          title="Bearbeiten"
        >
          ✏️
        </button>
      </div>

      {/* Content */}
      <div className="px-4">
        {recipe.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={recipe.image_url} alt={recipe.name} className="w-full h-48 object-cover" />
          </div>
        )}

        {isMarkedForCooking && (
          <div className="mb-3 p-2 bg-orange-100 border border-orange-300 rounded flex justify-between items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-orange-800">Zum Kochen markiert</div>
              <div className="text-xs text-orange-600">Zutaten in Einkaufsliste</div>
            </div>
            <button
              onClick={handleMarkAsCooked}
              className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs font-medium flex-shrink-0"
            >
              Gekocht ✓
            </button>
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Zutaten ({recipe.ingredients?.length || 0})</h4>
            <button onClick={toggleAll} className="text-xs text-blue-600 hover:text-blue-700">
              {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
            </button>
          </div>

          {!recipe.ingredients || recipe.ingredients.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Zutaten vorhanden</p>
          ) : (
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-center gap-2 p-1.5 border rounded text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.has(ing.id)}
                    onChange={() => toggleIngredient(ing.id)}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {recipe.instructions && (
          <div className="mb-3">
            <h4 className="font-semibold mb-1.5 text-sm">Anleitung</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border">
              {recipe.instructions}
            </div>
          </div>
        )}

        {recipe.servings && !isMarkedForCooking && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <label className="block text-xs font-medium text-blue-900 mb-2">
              Für wie viele Personen möchtest du kochen?
            </label>
            <div className="flex gap-1.5 items-center mb-2">
              <button
                onClick={() => setDesiredServings(Math.max(0.5, desiredServings - 0.5))}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-8 h-8 rounded text-base leading-none flex-shrink-0"
              >
                −
              </button>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={desiredServings}
                onChange={(e) => setDesiredServings(parseFloat(e.target.value) || 0.5)}
                className="flex-1 text-center border border-blue-300 rounded px-2 py-1 text-sm font-medium min-w-0"
              />
              <button
                onClick={() => setDesiredServings(desiredServings + 0.5)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-8 h-8 rounded text-base leading-none flex-shrink-0"
              >
                +
              </button>
            </div>
            <div className="text-center mb-2">
              <div className="inline-block px-3 py-1.5 bg-blue-100 rounded-full">
                <span className="text-xs text-blue-700">Original: {recipe.servings} Personen</span>
                <span className="mx-1.5 text-blue-400">→</span>
                <span className="text-xs font-semibold text-blue-900">
                  Faktor: {((desiredServings || 1) / (recipe.servings || 1)).toFixed(2)}x
                </span>
              </div>
            </div>
            {desiredServings !== recipe.servings && (
              <div className="p-2 bg-white rounded border border-blue-100">
                <h5 className="font-medium text-xs text-blue-900 mb-1.5">Angepasste Mengen:</h5>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <button
            onClick={handleAddToShopping}
            disabled={adding || selectedIngredients.size === 0}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {adding ? 'Wird hinzugefügt...' : 'Kochen - Zutaten zur Einkaufsliste'}
          </button>
        </div>
      )}
    </div>
  );
}
