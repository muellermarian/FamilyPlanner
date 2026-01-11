import { useState, useMemo } from 'react';
import type { Recipe } from '../../lib/types';

export function useRecipeSearch(recipes: Recipe[], markedRecipeIds: Set<string>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedRecipes = useMemo(() => {
    // Filter recipes by search query (matches name or ingredient)
    const filtered = recipes.filter((recipe) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();

      // Match query in recipe name
      if (recipe.name.toLowerCase().includes(query)) return true;

      // Match query in any ingredient name
      if (recipe.ingredients?.some((ing) => ing.name.toLowerCase().includes(query))) return true;

      return false;
    });

    // Sort: recipes marked for cooking first, then alphabetically by name
    return [...filtered].sort((a, b) => {
      const aMarked = markedRecipeIds.has(a.id) ? 0 : 1;
      const bMarked = markedRecipeIds.has(b.id) ? 0 : 1;

      if (aMarked !== bMarked) {
        return aMarked - bMarked;
      }

      return a.name.localeCompare(b.name, 'de');
    });
  }, [recipes, searchQuery, markedRecipeIds]);

  return {
    searchQuery,
    setSearchQuery,
    filteredRecipes: filteredAndSortedRecipes,
  };
}
