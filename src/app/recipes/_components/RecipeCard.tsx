'use client';

import Image from 'next/image';
import { Clock, Flame } from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { FavoriteButton } from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  onToggleFavorite: () => void;
  className?: string;
}

export function RecipeCard({ recipe, onClick, onToggleFavorite, className = '' }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View recipe: ${recipe.title}`}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl shadow-md 
        border border-gray-200 dark:border-gray-700 overflow-hidden
        cursor-pointer transition-all duration-200 ease-in-out
        hover:shadow-lg hover:scale-[1.02] min-h-[400px]
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${className}
      `}
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* AI Generated Badge */}
        {recipe.isAiGenerated && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
            <span className="text-xs">✨</span>
            <span>AI Generated</span>
          </div>
        )}
        
        {/* Meal Type Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
          {recipe.mealType.charAt(0) + recipe.mealType.slice(1).toLowerCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
          {recipe.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem]">
          {recipe.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Time */}
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
            
            {/* Calories */}
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <Flame className="w-4 h-4" />
              <span>{recipe.nutrition.calories} cal</span>
            </div>
          </div>

          {/* Favorite Button */}
          <FavoriteButton
            isFavorite={recipe.isFavorite}
            onToggle={onToggleFavorite}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {/* Difficulty Badge */}
          <span className={`
            px-3 py-1 text-xs font-medium rounded-full
            ${difficultyColors[recipe.difficulty]}
          `}>
            {recipe.difficulty}
          </span>
          
          {/* First tag if available */}
          {recipe.tags[0] && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {recipe.tags[0]}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
