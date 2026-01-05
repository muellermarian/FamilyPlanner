import type { Recipe } from '../../lib/types';
import { useState } from 'react';

interface RecipeItemProps {
  recipe: Recipe;
  onClick: () => void;
  isMarkedForCooking: boolean;
  onMarkCooked: (recipeId: string) => void;
}

export default function RecipeItem({
  recipe,
  onClick,
  isMarkedForCooking,
  onMarkCooked,
}: RecipeItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCookedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    onMarkCooked(recipe.id);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className={`relative flex flex-col bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow min-h-[140px] ${
      isMarkedForCooking ? 'border-orange-500 border-2' : ''
    }`}>

      <button onClick={onClick} className="flex-1 flex flex-col p-3 text-left">
        <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-5 break-words hyphens-auto">{recipe.name}</h3>
        <p className="text-xs text-gray-500 mt-auto">{recipe.ingredients?.length || 0} Zutaten</p>
      </button>

      {isMarkedForCooking && (
        <div className="px-3 pb-3">
          <button
            onClick={handleCookedClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded"
          >
            ✓ Gekocht
          </button>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3">Rezept als gekocht markieren?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Möchtest du &quot;{recipe.name}&quot; wirklich als gekocht markieren?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Ja, gekocht
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
