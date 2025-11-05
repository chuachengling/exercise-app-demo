'use client';

import { RefreshCw, Sparkles, WifiOff } from 'lucide-react';
import { useRecipes } from './_components/useRecipes';
import { RecipeGrid } from './_components/RecipeGrid';
import { RecipeFilters } from './_components/RecipeFilters';
import { RecipeDetail } from './_components/RecipeDetail';
import { RecipeSkeletonGrid } from './_components/RecipeSkeleton';

// Mock user data - in production this would come from auth context
const MOCK_USER = {
  id: 'user-123',
  healthGoals: ['weight_loss', 'general_health'] as ('weight_loss' | 'general_health')[],
};

export default function RecipesPage() {
  const {
    isLoading,
    isRefreshing,
    isGenerating,
    isOnline,
    filteredRecipes,
    selectedRecipe,
    showDetail,
    activeFilter,
    error,
    generationProgress,
    streamingChunks,
    refreshRecipes,
    toggleFavorite,
    setFilter,
    selectRecipe,
    closeRecipe,
    clearError,
  } = useRecipes(MOCK_USER.id, MOCK_USER.healthGoals);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recipe Suggestions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                AI-powered personalized recipes based on your health goals
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshRecipes}
              disabled={isRefreshing || isGenerating || !isOnline}
              className="
                flex items-center space-x-2 px-4 py-2.5
                bg-gradient-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                disabled:from-gray-400 disabled:to-gray-500
                text-white font-semibold rounded-lg
                shadow-md hover:shadow-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                disabled:cursor-not-allowed
              "
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing || isGenerating ? 'animate-spin' : ''}`} />
              <span>{isRefreshing || isGenerating ? 'Generating...' : 'New Recipes'}</span>
            </button>
          </div>

          {/* Online/Offline Indicator */}
          {!isOnline && (
            <div className="mt-4 flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">Offline - Showing cached recipes</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </div>
          <RecipeFilters
            activeFilter={activeFilter}
            onFilterChange={setFilter}
            recipeCount={filteredRecipes.length}
          />
        </div>

        {/* Generation Progress (Ollama Streaming) */}
        {isGenerating && streamingChunks.length > 0 && (
          <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                AI is generating recipes...
              </h3>
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-2">
              Received {streamingChunks.length} chunks
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {generationProgress.slice(0, 200)}
                {generationProgress.length > 200 && '...'}
              </code>
            </div>
          </div>
        )}

        {/* Recipes Grid or Loading State */}
        {isLoading ? (
          <RecipeSkeletonGrid count={6} />
        ) : (
          <RecipeGrid
            recipes={filteredRecipes}
            onRecipeClick={selectRecipe}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Recipe Detail Modal */}
        <RecipeDetail
          recipe={selectedRecipe}
          isOpen={showDetail}
          onClose={closeRecipe}
          onToggleFavorite={() => selectedRecipe && toggleFavorite(selectedRecipe.id)}
        />
      </div>
    </div>
  );
}
