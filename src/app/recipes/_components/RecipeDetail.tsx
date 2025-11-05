'use client';

import { Recipe } from '@/lib/types/recipe';
import { X, Clock, Users, ChefHat } from 'lucide-react';
import Image from 'next/image';
import { FavoriteButton } from './FavoriteButton';
import { useEffect } from 'react';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}

export function RecipeDetail({ recipe, isOpen, onClose, onToggleFavorite }: RecipeDetailProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-title"
    >
      <div 
        className="
          relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
          max-w-4xl w-full max-h-[90vh] overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10 p-2 
            bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
            rounded-full shadow-lg
            hover:bg-white dark:hover:bg-gray-700
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-green-500
          "
          aria-label="Close recipe details"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Favorite Button Overlay */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1">
                <FavoriteButton
                  isFavorite={recipe.isFavorite}
                  onToggle={onToggleFavorite}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <h2 
                id="recipe-title"
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              >
                {recipe.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {recipe.description}
              </p>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Time</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {totalTime} min
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Servings</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {recipe.servings}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {recipe.difficulty}
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Nutrition Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {recipe.nutrition.calories}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {recipe.nutrition.protein}g
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {recipe.nutrition.carbs}g
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {recipe.nutrition.fat}g
                  </p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li 
                    key={index}
                    className="flex items-start space-x-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                      {' '}{ingredient.name}
                      {ingredient.optional && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                          (optional)
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li 
                    key={index}
                    className="flex space-x-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-700 dark:text-gray-300 pt-1">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
