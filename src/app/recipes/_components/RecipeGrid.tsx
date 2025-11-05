'use client';

import { Recipe } from '@/lib/types/recipe';
import { RecipeCard } from './RecipeCard';
import { ChefHat } from 'lucide-react';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  className?: string;
}

export function RecipeGrid({ recipes, onRecipeClick, onToggleFavorite, className = '' }: RecipeGridProps) {
  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-6">
          <ChefHat className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          No recipes found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Try adjusting your filters or generate new recipes to discover delicious meals tailored to your health goals.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      role="list"
      aria-label="Recipe list"
    >
      {recipes.map((recipe) => (
        <div key={recipe.id} role="listitem">
          <RecipeCard
            recipe={recipe}
            onClick={() => onRecipeClick(recipe)}
            onToggleFavorite={() => onToggleFavorite(recipe.id)}
          />
        </div>
      ))}
    </div>
  );
}
