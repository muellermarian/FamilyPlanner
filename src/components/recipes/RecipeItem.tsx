import type { Recipe } from '../../lib/types';
import { useState, useMemo } from 'react';

interface RecipeItemProps {
  recipe: Recipe;
  onClick: () => void;
  isMarkedForCooking: boolean;
  onMarkCooked: (recipeId: string) => void;
}

const GRADIENTS = [
  'from-orange-100 to-red-100',
  'from-yellow-100 to-orange-100',
  'from-green-100 to-teal-100',
  'from-blue-100 to-cyan-100',
  'from-purple-100 to-pink-100',
  'from-pink-100 to-rose-100',
  'from-indigo-100 to-purple-100',
  'from-teal-100 to-green-100',
];

function getRecipeGradient(recipeId: string) {
  const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % GRADIENTS.length;
  return GRADIENTS[gradientIndex];
}

export default function RecipeItem({
  recipe,
  onClick,
  isMarkedForCooking,
  onMarkCooked,
}: RecipeItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const gradient = useMemo(() => getRecipeGradient(recipe.id), [recipe.id]);

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
    <div
      className={`relative flex flex-col bg-gradient-to-br ${gradient} border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 min-h-[160px] ${
        isMarkedForCooking ? 'border-orange-500 border-2 ring-2 ring-orange-300' : 'border-gray-200'
      }`}
    >
      {/* Large Emoji Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20 pointer-events-none select-none">
        👨‍🍳
      </div>

      <button onClick={onClick} className="relative flex-1 flex flex-col p-4 text-left z-10">
        <h3
          className="font-semibold text-sm leading-tight mb-2 line-clamp-4 break-words hyphens-auto text-gray-900"
          style={{
            textShadow:
              '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 2px 2px 4px rgba(255, 255, 255, 0.9)',
          }}
        >
          {recipe.name}
        </h3>
      </button>

      {isMarkedForCooking && (
        <div className="relative px-3 pb-3 z-10">
          <button
            onClick={handleCookedClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg shadow-md transition-colors"
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
