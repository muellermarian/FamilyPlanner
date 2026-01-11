// RecipeAddForm: Form for adding a new recipe
// Only comments are changed, all user-facing German content is preserved
import { useState } from 'react';
import RecipeFormShared from './RecipeFormShared';

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
  // State management for recipe form
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '1', unit: 'Stk', add_to_shopping: true },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Ingredient management helpers
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
      console.error('Error adding recipe:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Render shared form and actions
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
        {/* Shared form content */}
        <RecipeFormShared
          name={name}
          setName={setName}
          instructions={instructions}
          setInstructions={setInstructions}
          servings={servings}
          setServings={setServings}
          ingredients={ingredients}
          setIngredients={setIngredients}
          addIngredient={addIngredient}
          removeIngredient={removeIngredient}
          updateIngredient={updateIngredient}
          moveIngredient={moveIngredient}
          submitting={submitting}
        />
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
