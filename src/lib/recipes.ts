import { supabase } from './supabaseClient';
import type { Recipe, RecipeIngredient, RecipeCooking } from './types';

/**
 * Upload a recipe image to Supabase Storage
 */
export async function uploadRecipeImage(file: File, familyId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${familyId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage.from('recipe-images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage.from('recipe-images').getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Get all recipes for a family with their ingredients
 */
export async function getRecipes(familyId: string): Promise<Recipe[]> {
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (recipesError) throw recipesError;
  if (!recipes || recipes.length === 0) return [];

  // Fetch ingredients for all recipes
  const recipeIds = recipes.map((r: any) => r.id);
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .in('recipe_id', recipeIds)
    .order('order_index', { ascending: true });

  if (ingredientsError) throw ingredientsError;

  // Attach ingredients to recipes
  const result: Recipe[] = recipes.map((r: any) => ({
    ...r,
    ingredients: (ingredients || []).filter((i: any) => i.recipe_id === r.id) as RecipeIngredient[],
  }));

  return result;
}

/**
 * Get a single recipe with ingredients
 */
export async function getRecipe(recipeId: string): Promise<Recipe | null> {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (recipeError) throw recipeError;
  if (!recipe) return null;

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('order_index', { ascending: true });

  if (ingredientsError) throw ingredientsError;

  return {
    ...recipe,
    ingredients: (ingredients || []) as RecipeIngredient[],
  };
}

/**
 * Add a new recipe with ingredients
 */
export async function addRecipe(
  familyId: string,
  name: string,
  imageUrl: string | null,
  instructions: string | null,
  servings: number | null,
  createdById: string,
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    add_to_shopping: boolean;
  }>
): Promise<void> {
  // Create the recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      family_id: familyId,
      name,
      image_url: imageUrl,
      instructions: instructions,
      servings: servings,
      created_by_id: createdById,
    })
    .select()
    .single();

  if (recipeError) throw recipeError;

  // Create ingredients
  if (ingredients.length > 0) {
    const ingredientRecords = ingredients.map((ing, index) => ({
      recipe_id: recipe.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      add_to_shopping: ing.add_to_shopping,
      order_index: index,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRecords);

    if (ingredientsError) throw ingredientsError;
  }
}

/**
 * Delete a recipe (cascade deletes ingredients)
 */
export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Update a recipe with ingredients
 */
export async function updateRecipe(
  recipeId: string,
  name: string,
  imageUrl: string | null,
  instructions: string | null,
  servings: number | null,
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    add_to_shopping: boolean;
  }>
): Promise<void> {
  // Update the recipe
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      name,
      image_url: imageUrl,
      instructions: instructions,
      servings: servings,
    })
    .eq('id', recipeId);

  if (recipeError) throw recipeError;

  // Delete existing ingredients
  const { error: deleteError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipeId);

  if (deleteError) throw deleteError;

  // Create new ingredients
  if (ingredients.length > 0) {
    const ingredientRecords = ingredients.map((ing, index) => ({
      recipe_id: recipeId,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      add_to_shopping: ing.add_to_shopping,
      order_index: index,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRecords);

    if (ingredientsError) throw ingredientsError;
  }
}

/**
 * Get active cooking records for a family
 */
export async function getActiveCookings(familyId: string): Promise<RecipeCooking[]> {
  const { data, error } = await supabase
    .from('recipe_cookings')
    .select('*')
    .eq('family_id', familyId)
    .is('cooked_at', null)
    .order('marked_at', { ascending: false });

  if (error) throw error;
  return (data as RecipeCooking[]) || [];
}

/**
 * Mark a recipe for cooking (ingredients added to shopping list)
 */
export async function markRecipeForCooking(
  recipeId: string,
  familyId: string,
  markedById: string
): Promise<void> {
  const { error } = await supabase.from('recipe_cookings').insert({
    recipe_id: recipeId,
    family_id: familyId,
    marked_by_id: markedById,
    marked_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/**
 * Mark a recipe as cooked
 */
export async function markRecipeAsCooked(
  recipeId: string,
  familyId: string,
  cookedById: string
): Promise<void> {
  // Find the active cooking record
  const { data: cookings, error: findError } = await supabase
    .from('recipe_cookings')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('family_id', familyId)
    .is('cooked_at', null)
    .order('marked_at', { ascending: false })
    .limit(1);

  if (findError) throw findError;
  if (!cookings || cookings.length === 0) return;

  const cooking = cookings[0];

  const { error } = await supabase
    .from('recipe_cookings')
    .update({
      cooked_at: new Date().toISOString(),
      cooked_by_id: cookedById,
    })
    .eq('id', cooking.id);

  if (error) throw error;
}

/**
 * Check if a recipe is currently marked for cooking
 */
export async function isRecipeMarkedForCooking(
  recipeId: string,
  familyId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('recipe_cookings')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('family_id', familyId)
    .is('cooked_at', null)
    .limit(1);

  if (error) throw error;
  return data && data.length > 0;
}
