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
      await onUpdate(
        name.trim(),
        null,
        null,
        instructions.trim(),
        servings,
        validIngredients
      );
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">Rezept bearbeiten</h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rezeptname *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                placeholder="Beschreibe die Zubereitungsschritte..."
                rows={6}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Anleitung</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                placeholder="z.B. 4"
                min="1"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Zutaten *</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Zutat hinzufügen
                </button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-start border p-3 rounded">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveIngredient(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 text-xs"
                        title="Nach oben"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveIngredient(index, 'down')}
                        disabled={index === ingredients.length - 1}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 text-xs"
                        title="Nach unten"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Zutat"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Menge"
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {QUANTITY_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={ing.add_to_shopping}
                          onChange={(e) =>
                            updateIngredient(index, 'add_to_shopping', e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <span>Zum Einkauf vorschlagen</span>
                      </label>
                    </div>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 font-bold"
                        title="Zutat entfernen"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              Löschen
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Speichern...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Rezept löschen?</h3>
            <p className="text-gray-700 mb-6">
              Möchtest du das Rezept "{recipe.name}" wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                disabled={submitting}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
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
