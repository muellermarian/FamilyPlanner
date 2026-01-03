import { useEffect, useState } from 'react';
import type { Recipe } from '../../lib/types';
import {
  getRecipes,
  addRecipe,
  deleteRecipe,
  getActiveCookings,
  updateRecipe,
  uploadRecipeImage,
} from '../../lib/recipes';
import RecipeItem from './RecipeItem';
import RecipeAddForm from './RecipeAddForm';
import RecipeDetail from './RecipeDetail';
import RecipeEditForm from './RecipeEditForm';

interface RecipeListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
}

export default function RecipeList({ familyId, currentUserId, currentProfileId }: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markedRecipeIds, setMarkedRecipeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes(familyId);
      setRecipes(data);

      // Fetch active cookings
      const cookings = await getActiveCookings(familyId);
      const markedIds = new Set(cookings.map((c) => c.recipe_id));
      setMarkedRecipeIds(markedIds);
    } catch (err: any) {
      setError(err?.message || String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [familyId]);

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
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Rezept wirklich löschen?')) return;

    try {
      await deleteRecipe(id);
      await fetchRecipes();
    } catch (err: any) {
      alert(err.message);
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

  const handleCloseDetail = () => {
    setSelectedRecipe(null);
  };

  const handleEdit = () => {
    if (selectedRecipe) {
      setEditRecipe(selectedRecipe);
    }
  };

  const handleUpdate = async () => {
    await fetchRecipes();
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search in recipe name
    if (recipe.name.toLowerCase().includes(query)) return true;

    // Search in ingredients
    if (recipe.ingredients?.some((ing) => ing.name.toLowerCase().includes(query))) return true;

    return false;
  });

  // Sort recipes: marked for cooking first, then by name
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const aMarked = markedRecipeIds.has(a.id) ? 0 : 1;
    const bMarked = markedRecipeIds.has(b.id) ? 0 : 1;

    if (aMarked !== bMarked) {
      return aMarked - bMarked;
    }

    return a.name.localeCompare(b.name, 'de');
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rezepte</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
        >
          + Neues Rezept
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche nach Rezeptname oder Zutat..."
          className="w-full border rounded px-4 py-2"
        />
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {loading
          ? '🔄 Lade Rezepte…'
          : searchQuery
          ? `${filteredRecipes.length} von ${recipes.length} Rezept(en)`
          : `${recipes.length} Rezept(e)`}
      </div>
      {error && <div className="mb-4 text-red-600">Fehler: {error}</div>}

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🍽️</div>
          {searchQuery ? (
            <>
              <p>Keine Rezepte gefunden.</p>
              <p className="text-sm mt-2">Versuche einen anderen Suchbegriff.</p>
            </>
          ) : (
            <>
              <p>Noch keine Rezepte vorhanden.</p>
              <p className="text-sm mt-2">Klicke auf &quot;Neues Rezept&quot; um zu starten.</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecipes.map((recipe) => (
          <RecipeItem
            key={recipe.id}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe)}
            isMarkedForCooking={markedRecipeIds.has(recipe.id)}
          />
        ))}
      </div>

      {showAddForm && <RecipeAddForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />}

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          familyId={familyId}
          currentUserId={currentUserId}
          currentProfileId={currentProfileId}
          isMarkedForCooking={markedRecipeIds.has(selectedRecipe.id)}
          onClose={handleCloseDetail}
          onUpdate={handleUpdate}
          onEdit={handleEdit}
        />
      )}

      {editRecipe && (
        <RecipeEditForm
          recipe={editRecipe}
          onUpdate={handleUpdateRecipe}
          onCancel={() => setEditRecipe(null)}
          onDelete={async () => {
            await handleDelete(editRecipe.id);
            setEditRecipe(null);
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}
