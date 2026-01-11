// Shared logic and UI for RecipeAddForm and RecipeEditForm
// Only comments are changed, all user-facing German content is preserved
import { QUANTITY_UNITS } from '../../lib/constants';

// Ingredient type for recipe forms
export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
}

// Props for the shared recipe form component
export interface RecipeFormSharedProps {
  name: string;
  setName: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  servings: number | null;
  setServings: (v: number | null) => void;
  ingredients: Ingredient[];
  setIngredients: (v: Ingredient[]) => void;
  submitting: boolean;
  addIngredient: () => void;
  removeIngredient: (index: number) => void;
  updateIngredient: (index: number, field: keyof Ingredient, value: any) => void;
  moveIngredient: (index: number, direction: 'up' | 'down') => void;
  children?: React.ReactNode;
}

type ReadonlyecipeFormSharedProps = Readonly<RecipeFormSharedProps>;

// Shared form component for recipe add/edit
export default function RecipeFormShared({
  name,
  setName,
  instructions,
  setInstructions,
  servings,
  setServings,
  ingredients,
  addIngredient,
  removeIngredient,
  updateIngredient,
  moveIngredient,
  children,
}: ReadonlyecipeFormSharedProps) {
  return (
    // Main form content
    <div className="px-4">
      {/* Recipe name input */}
      <div className="mb-3">
        <label htmlFor="recipe-name" className="block text-xs font-medium mb-1">
          Rezeptname *
        </label>
        <input
          id="recipe-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm"
          placeholder="z.B. Spaghetti Carbonara"
          required
          autoFocus
        />
      </div>
      {/* Instructions textarea */}
      <div className="mb-3">
        <label htmlFor="recipe-instructions" className="block text-xs font-medium mb-1">
          Anleitung
        </label>
        <textarea
          id="recipe-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm"
          placeholder="Beschreibe die Zubereitungsschritte..."
          rows={6}
        />
      </div>
      {/* Servings input */}
      <div className="mb-3">
        <label htmlFor="recipe-servings" className="block text-xs font-medium mb-1">
          Portionen
        </label>
        <input
          id="recipe-servings"
          type="number"
          value={servings ?? ''}
          onChange={(e) => setServings(e.target.value ? Number.parseInt(e.target.value) : null)}
          className="w-full border rounded px-2 py-1.5 text-sm"
          placeholder="z.B. 4"
          min="1"
        />
      </div>
      {/* Ingredients section */}
      <div className="mb-3">
        {/* Add ingredient button and label */}
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="ingredient-list" className="block text-xs font-medium">
            Zutaten *
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            + Zutat hinzufügen
          </button>
        </div>
        {/* List of ingredient rows */}
        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            // Ingredient row
            <div
              key={ing.name + '-' + index}
              className="flex gap-1.5 items-start border p-2 rounded"
              id={index === 0 ? 'ingredient-list' : undefined}
            >
              {/* Move ingredient up/down buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveIngredient(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed px-1 py-0.5 text-xs"
                  title="Nach oben"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveIngredient(index, 'down')}
                  disabled={index === ingredients.length - 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed px-1 py-0.5 text-xs"
                  title="Nach unten"
                >
                  ▼
                </button>
              </div>
              {/* Ingredient details */}
              <div className="flex-1 space-y-1.5">
                {/* Ingredient name input */}
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="Zutat"
                  required
                />
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Quantity input */}
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                    placeholder="Menge"
                  />
                  {/* Unit select */}
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Add to shopping checkbox */}
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={ing.add_to_shopping}
                    onChange={(e) => updateIngredient(index, 'add_to_shopping', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span>Zum Einkauf</span>
                </label>
              </div>
              {/* Remove ingredient button */}
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-600 hover:text-red-800 px-1 py-0.5 text-xs font-bold shrink-0"
                  title="Zutat entfernen"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Render any additional children (actions, etc.) */}
      {children}
    </div>
  );
}
