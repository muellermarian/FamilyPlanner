import { useState, useEffect } from 'react';
import { QUANTITY_UNITS } from '../../lib/constants';
import { deleteRecipe } from '../../lib/recipes';
import type { Recipe } from '../../lib/types';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
}

interface RecipeEditFormProps {
  recipe: Recipe;
  onUpdate: (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Ingredient[]
  ) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}

export default function RecipeEditForm({
  recipe,
  onUpdate,
  onCancel,
  onDelete,
}: RecipeEditFormProps) {
  const [name, setName] = useState(recipe.name);
  const [instructions, setInstructions] = useState(recipe.instructions || '');
  const [servings, setServings] = useState<number | null>(recipe.servings || null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Initialize ingredients from recipe
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      setIngredients(
        recipe.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          add_to_shopping: ing.add_to_shopping,
        }))
      );
    } else {
      setIngredients([{ name: '', quantity: '1', unit: 'Stk', add_to_shopping: true }]);
    }
  }, [recipe]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '1', unit: 'Stk', add_to_shopping: true },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const moveIngredient = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ingredients.length) return;

    const updated = [...ingredients];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setIngredients(updated);
  };

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
      await onUpdate(name.trim(), null, null, instructions.trim(), servings, validIngredients);
    } catch (err) {
      // Silent fail on recipe update
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteRecipe(recipe.id);
      onDelete();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-4">
        <form onSubmit={handleSubmit}>
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold">Rezept bearbeiten</h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none px-2"
            >
              ×
            </button>
          </div>

          <div className="p-3 max-h-[75vh] overflow-y-auto">
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Rezeptname *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="z.B. Spaghetti Carbonara"
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Anleitung</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Beschreibe die Zubereitungsschritte..."
                rows={6}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Portionen</label>
              <input
                type="number"
                value={servings ?? ''}
                onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="z.B. 4"
                min="1"
              />
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium">Zutaten *</label>
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
                  <div key={index} className="flex gap-1.5 items-start border p-2 rounded">
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
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-xs"
                        placeholder="Zutat"
                        required
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                          placeholder="Menge"
                        />
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
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800 px-1 py-0.5 text-xs font-bold flex-shrink-0"
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

          <div className="p-3 border-t flex gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="px-3 py-1.5 border border-red-600 text-red-600 rounded hover:bg-red-50 text-xs font-medium"
            >
              Löschen
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-1.5 border rounded hover:bg-gray-100 text-xs font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
            >
              {submitting ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
            <h3 className="text-base font-bold mb-3">Rezept löschen?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Möchtest du das Rezept "{recipe.name}" wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-3 py-1.5 border rounded hover:bg-gray-100 text-xs font-medium"
                disabled={submitting}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                disabled={submitting}
              >
                {submitting ? 'Löschen...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
