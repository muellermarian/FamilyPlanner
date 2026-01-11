import { useState, useEffect } from 'react';
import type { Recipe } from '../../lib/types';
import { getRecipes, getActiveCookings, deleteRecipe, markRecipeAsCooked } from '../../lib/recipes';

export function useRecipes(familyId: string) {
  // State for all recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  // Loading state for async operations
  const [loading, setLoading] = useState(false);
  // Error state for fetch or mutation errors
  const [error, setError] = useState<string | null>(null);
  // Set of recipe IDs marked as 'to be cooked'
  const [markedRecipeIds, setMarkedRecipeIds] = useState<Set<string>>(new Set());

  const fetchRecipes = async () => {
    // Fetch all recipes and active cookings for the family
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes(familyId);
      setRecipes(data);

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
    // Refetch recipes when familyId changes
    fetchRecipes();
  }, [familyId]);

  const handleDelete = async (id: string) => {
    // Confirm before deleting a recipe
    if (!confirm('Rezept wirklich löschen?')) return;

    try {
      await deleteRecipe(id);
      await fetchRecipes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkCooked = async (recipeId: string, currentProfileId: string) => {
    // Mark a recipe as cooked and refetch recipes
    try {
      await markRecipeAsCooked(recipeId, familyId, currentProfileId);
      await fetchRecipes();
      return recipes.find((r) => r.id === recipeId);
    } catch (err: any) {
      alert(err.message || 'Fehler beim Markieren des Rezepts');
      return null;
    }
  };

  return {
    // Expose state and handlers for recipes
    recipes,
    loading,
    error,
    markedRecipeIds,
    fetchRecipes,
    handleDelete,
    handleMarkCooked,
  };
}
