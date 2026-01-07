import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type GroupedIngredient = {
  name: string;
  recipes: string[];
};

interface IngredientsListProps {
  familyId: string;
  onClose: () => void;
}

export default function IngredientsList({ familyId, onClose }: IngredientsListProps) {
  const [ingredients, setIngredients] = useState<GroupedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadIngredients();
  }, [familyId]);

  // Load and group all ingredients by name, collecting all recipe names for each ingredient
  const loadIngredients = async () => {
    setLoading(true);
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, recipe_ingredients(name)')
        .eq('family_id', familyId)
        .order('name');
      if (error) throw error;
      const grouped: Record<string, Set<string>> = {};
      recipes?.forEach((recipe: any) => {
        recipe.recipe_ingredients?.forEach((ing: any) => {
          if (!grouped[ing.name]) grouped[ing.name] = new Set();
          grouped[ing.name].add(recipe.name);
        });
      });
      const groupedArray: GroupedIngredient[] = Object.entries(grouped)
        .map(([name, recipes]) => ({ name, recipes: Array.from(recipes).sort() }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setIngredients(groupedArray);
    } catch (err) {
      console.error('Error loading ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (name: string) => setCopiedName(name);

  // Rename all ingredients with the given targetName to the copiedName for this family
  const handleAdopt = async (targetName: string) => {
    if (!copiedName || copiedName === targetName) return;
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('family_id', familyId);
      if (error) throw error;
      const recipeIds = (recipes || []).map((r: any) => r.id);
      if (recipeIds.length > 0) {
        const { data: ingredients, error: ingError } = await supabase
          .from('recipe_ingredients')
          .select('id')
          .in('recipe_id', recipeIds)
          .eq('name', targetName);
        if (ingError) throw ingError;
        const ingredientIds = (ingredients || []).map((i: any) => i.id);
        if (ingredientIds.length > 0) {
          const { error: updateError } = await supabase
            .from('recipe_ingredients')
            .update({ name: copiedName })
            .in('id', ingredientIds);
          if (updateError) throw updateError;
        }
      }
      await loadIngredients();
      setCopiedName(null);
    } catch (err: any) {
      alert('Error while adopting: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose} className="text-2xl">
          ←
        </button>
        <h2 className="text-xl font-bold">Zutatenliste</h2>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Zutat..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Copied Name Display */}
      {copiedName && (
        <div className="sticky top-0 bg-blue-50 border border-blue-300 rounded p-3 mb-4 z-10 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Markiert:</span>
              <span className="font-bold text-blue-700">{copiedName}</span>
            </div>
            <button
              onClick={() => setCopiedName(null)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Ingredients List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Lade Zutaten...</div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Keine Zutaten gefunden</div>
      ) : (
        <div className="space-y-2">
          {ingredients
            .filter((ing) => ing.name.toLowerCase().includes(search.toLowerCase()))
            .map((ing, idx) => (
              <div
                key={`${ing.name}-${idx}`}
                className={`bg-white border rounded p-3 shadow-sm ${
                  copiedName === ing.name ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{ing.name}</div>
                    <div className="text-xs text-gray-600">
                      {ing.recipes.map((recipe, i) => (
                        <div key={i} className="text-gray-500">
                          • {recipe}
                        </div>
                      ))}
                    </div>
                  </div>
                  {copiedName === ing.name ? (
                    <button
                      onClick={() => handleCopy(ing.name)}
                      className="shrink-0 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap bg-blue-600 text-white"
                    >
                      ✓
                    </button>
                  ) : copiedName ? (
                    <button
                      onClick={() => handleAdopt(ing.name)}
                      className="shrink-0 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
                    >
                      Übernehmen
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCopy(ing.name)}
                      className="shrink-0 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Markieren
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">Gesamt: {ingredients.length} Zutaten</div>
    </div>
  );
}
