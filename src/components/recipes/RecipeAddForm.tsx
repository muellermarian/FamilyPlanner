import { useState } from 'react';
import { QUANTITY_UNITS } from '../../lib/constants';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
}

interface RecipeAddFormProps {
  onAdd: (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Ingredient[]
  ) => Promise<void>;
  onCancel: () => void;
}

export default function RecipeAddForm({ onAdd, onCancel }: RecipeAddFormProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '1', unit: 'Stk', add_to_shopping: true },
  ]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(''); // Clear URL if file is selected

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview(null);
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
      await onAdd(
        name.trim(),
        imageUrl.trim() || null,
        imageFile,
        instructions.trim(),
        servings,
        validIngredients
      );
      setName('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setInstructions('');
      setServings(null);
      setIngredients([{ name: '', quantity: '1', unit: 'Stk', add_to_shopping: true }]);
    } catch (err) {
      // Silent fail on recipe add
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">Neues Rezept</h3>
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
              <label className="block text-sm font-medium mb-1">Rezeptbild</label>

              {imagePreview && (
                <div className="mb-3 relative">
                  <img
                    src={imagePreview}
                    alt="Vorschau"
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Entfernen
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Foto aufnehmen oder auswählen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div className="text-center text-xs text-gray-500">oder</div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bild-URL eingeben</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="https://..."
                    disabled={!!imageFile}
                  />
                </div>
              </div>
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
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Speichern...' : 'Rezept speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
