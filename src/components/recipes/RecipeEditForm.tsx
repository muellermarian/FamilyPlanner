// RecipeEditForm: Form for editing an existing recipe
// Only comments are changed, all user-facing German content is preserved
import { useState, useEffect } from 'react';
import { deleteRecipe } from '../../lib/recipes';
import type { Recipe } from '../../lib/types';
import RecipeFormShared from './RecipeFormShared';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  add_to_shopping: boolean;
}

interface RecipeEditFormProps {
  // The recipe to edit
  recipe: Recipe;
  // Callback for updating the recipe
  onUpdate: (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Ingredient[]
  ) => Promise<void>;
  // Callback for canceling the edit
  onCancel: () => void;
  // Callback for deleting the recipe
  onDelete: () => void;
}

type ReadonlyRecipeEditFormProps = Readonly<RecipeEditFormProps>;

export default function RecipeEditForm({
  recipe,
  onUpdate,
  onCancel,
  onDelete,
}: ReadonlyRecipeEditFormProps) {
  // State management for recipe form
  const [name, setName] = useState(recipe.name);
  const [instructions, setInstructions] = useState(recipe.instructions || '');
  const [servings, setServings] = useState<number | null>(recipe.servings || null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize ingredients from recipe
  useEffect(() => {
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
      await onUpdate(name.trim(), null, null, instructions.trim(), servings, validIngredients);
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Rezepts:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle recipe deletion
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
          <h3 className="text-lg font-bold flex-1">Rezept bearbeiten</h3>
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
        {/* Bottom bar with cancel, save, and delete buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
          >
            Löschen
          </button>
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <dialog
          open
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
        >
          {/* Overlay button for closing dialog on click outside */}
          <button
            type="button"
            tabIndex={0}
            aria-label="Dialog schließen"
            className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
            style={{ zIndex: 1, left: 0, top: 0, right: 0, bottom: 0, position: 'fixed' }}
            onClick={() => setShowDeleteDialog(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowDeleteDialog(false);
            }}
          />
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4 relative">
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
        </dialog>
      )}
    </div>
  );
}
