import { useState } from 'react';
import type { Recipe } from '../../lib/types';
import { addRecipe, updateRecipe, uploadRecipeImage } from '../../lib/recipes';
import { useToast } from '../../hooks/useToast';
import { useRecipes } from './useRecipes';
import { useRecipeSearch } from './useRecipeSearch';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';
import RecipeItem from './RecipeItem';
import RecipeAddForm from './RecipeAddForm';
import RecipeDetail from './RecipeDetail';
import RecipeEditForm from './RecipeEditForm';
import IngredientsList from './IngredientsList';

interface RecipeListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
}

export default function RecipeList({
  familyId,
  currentUserId,
  currentProfileId,
}: Readonly<RecipeListProps>) {
  // Recipes state and handlers
  const { recipes, loading, error, markedRecipeIds, fetchRecipes, handleDelete, handleMarkCooked } =
    useRecipes(familyId);
  // Search state and handlers
  const { searchQuery, setSearchQuery, filteredRecipes } = useRecipeSearch(
    recipes,
    markedRecipeIds
  );
  // Toast notification state
  const { toast, showToast } = useToast();

  // UI state for add, edit, detail, and ingredients views
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showIngredientsList, setShowIngredientsList] = useState(false);

  const handleAdd = async (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
      add_to_shopping: boolean;
    }>
  ) => {
    try {
      let finalImageUrl = imageUrl;

      // Upload image file if provided
      if (imageFile) {
        finalImageUrl = await uploadRecipeImage(imageFile, familyId);
      }

      await addRecipe(
        familyId,
        name,
        finalImageUrl,
        instructions,
        servings,
        currentProfileId || currentUserId,
        ingredients
      );
      await fetchRecipes();
      setShowAddForm(false);
      showToast('Rezept gespeichert ✓');
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleUpdateRecipe = async (
    name: string,
    imageUrl: string | null,
    imageFile: File | null,
    instructions: string,
    servings: number | null,
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
      add_to_shopping: boolean;
    }>
  ) => {
    if (!editRecipe) return;

    try {
      let finalImageUrl = imageUrl;

      // Upload image file if provided
      if (imageFile) {
        finalImageUrl = await uploadRecipeImage(imageFile, familyId);
      }

      await updateRecipe(editRecipe.id, name, finalImageUrl, instructions, servings, ingredients);
      await fetchRecipes();
      setEditRecipe(null);
      setSelectedRecipe(null);
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleMarkCookedWithToast = async (recipeId: string) => {
    const recipe = await handleMarkCooked(recipeId, currentProfileId || currentUserId);
    if (recipe) {
      showToast(`"${recipe.name}" als gekocht markiert ✓`);
    }
  };

  const handleEdit = () => {
    if (selectedRecipe) {
      setEditRecipe(selectedRecipe);
      setSelectedRecipe(null); // Close detail view when opening edit
    }
  };

  let content;
  if (showIngredientsList) {
    content = <IngredientsList familyId={familyId} onClose={() => setShowIngredientsList(false)} />;
  } else if (selectedRecipe) {
    content = (
      <RecipeDetail
        recipe={selectedRecipe}
        familyId={familyId}
        currentUserId={currentUserId}
        currentProfileId={currentProfileId}
        isMarkedForCooking={markedRecipeIds.has(selectedRecipe.id)}
        onClose={() => setSelectedRecipe(null)}
        onUpdate={fetchRecipes}
        onEdit={handleEdit}
        onAddToShopping={showToast}
      />
    );
  } else if (editRecipe) {
    content = (
      <RecipeEditForm
        recipe={editRecipe}
        onUpdate={handleUpdateRecipe}
        onCancel={() => {
          setEditRecipe(null);
        }}
        onDelete={async () => {
          await handleDelete(editRecipe.id);
          setEditRecipe(null);
        }}
      />
    );
  } else if (showAddForm) {
    content = <RecipeAddForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />;
  } else {
    content = (
      <>
        {/* Main recipe list view */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-3">Rezepte</h2>
          <div className="flex gap-2">
            {/* Button to show ingredients list */}
            <button
              onClick={() => setShowIngredientsList(true)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-medium text-sm"
            >
              📋 Zutaten
            </button>
            {/* Button to show add recipe form */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium text-sm"
            >
              + Rezept
            </button>
          </div>
        </div>

        {/* Search input for filtering recipes */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche nach Rezeptname oder Zutat..."
            className="w-full border rounded px-4 py-2"
          />
        </div>

        {/* Info about loading state and recipe count */}
        <div className="mb-4 text-sm text-gray-600">
          {loading ? '🔄 Lade Rezepte…' : `${filteredRecipes.length} Rezept(e)`}
        </div>
        {/* Error message if loading failed */}
        {error && <div className="mb-4 text-red-600">Fehler: {error}</div>}

        {/* Empty state if no recipes found */}
        {filteredRecipes.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p>Keine Rezepte vorhanden.</p>
          </div>
        )}

        {/* Grid of recipe items */}
        <div className="grid grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeItem
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe)}
              isMarkedForCooking={markedRecipeIds.has(recipe.id)}
              onMarkCooked={handleMarkCookedWithToast}
            />
          ))}
        </div>
      </>
    );
  }
  return (
    <div>
      <PullToRefresh onRefresh={fetchRecipes}>
        <div className="max-w-4xl mx-auto p-4">
          {content}
          {/* Toast notification for feedback */}
          <Toast message={toast || ''} />
        </div>
      </PullToRefresh>
    </div>
  );
}
