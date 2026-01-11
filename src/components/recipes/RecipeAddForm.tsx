// RecipeAddForm: Form for adding a new recipe
// Only comments are changed, all user-facing German content is preserved
import { useState } from 'react';
import { QUANTITY_UNITS } from '../../lib/constants';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
}

interface RecipeAddFormProps {
  // Callback for adding a recipe
  onAdd: (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Ingredient[]
  ) => Promise<void>;
  // Callback for canceling the form
  onCancel: () => void;
}

type ReadonlyRecipeAddFormProps = Readonly<RecipeAddFormProps>;

export default function RecipeAddForm({ onAdd, onCancel }: ReadonlyRecipeAddFormProps) {
  // State for recipe name
  const [name, setName] = useState('');
  // State for instructions
  const [instructions, setInstructions] = useState('');
  // State for number of servings
  const [servings, setServings] = useState<number | null>(null);
  // State for ingredients list
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '1', unit: 'Stk', add_to_shopping: true },
  ]);
  // State for submit button
  const [submitting, setSubmitting] = useState(false);

  // Add a new empty ingredient to the list
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '1', unit: 'Stk', add_to_shopping: true },
    ]);
  };

  // Remove an ingredient by index
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Update a field of an ingredient by index
  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Move an ingredient up or down in the list
  const moveIngredient = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ingredients.length) return;

    const updated = [...ingredients];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setIngredients(updated);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      alert('Bitte füge mindestens eine Zutat hinzu');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(name.trim(), null, null, instructions.trim(), servings, validIngredients);
      setName('');
      setInstructions('');
      setServings(null);
      setIngredients([{ name: '', quantity: '1', unit: 'Stk', add_to_shopping: true }]);
    } catch (err) {
      // Log error for debugging
      console.error('Error adding recipe:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <form onSubmit={handleSubmit}>
        {/* Top bar with back button and title */}
        <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 text-2xl"
            aria-label="Zurück"
          >
            ←
          </button>
          <h3 className="text-lg font-bold flex-1">Neues Rezept</h3>
        </div>

        {/* Content */}
        <div className="px-4">
          <div className="mb-3">
            {/* Recipe name input */}
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

          <div className="mb-3">
            {/* Instructions textarea */}
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

          <div className="mb-3">
            {/* Servings input */}
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

          <div className="mb-3">
            {/* Ingredients section */}
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

            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                // Ingredient row
                <div
                  key={ing.name + '-' + index}
                  className="flex gap-1.5 items-start border p-2 rounded"
                  id={index === 0 ? 'ingredient-list' : undefined}
                >
                  <div className="flex flex-col gap-0.5">
                    {/* Move ingredient up */}
                    <button
                      type="button"
                      onClick={() => moveIngredient(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed px-1 py-0.5 text-xs"
                      title="Nach oben"
                    >
                      ▲
                    </button>
                    {/* Move ingredient down */}
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
                        onChange={(e) =>
                          updateIngredient(index, 'add_to_shopping', e.target.checked)
                        }
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
        </div>

        {/* Fixed bottom action bar */}
        {/* Bottom bar with cancel and save buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? 'Speichern...' : 'Rezept speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
