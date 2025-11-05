import { Recipe } from '../types/recipe';

const STORAGE_KEYS = {
  RECIPES: 'exercise-app-recipes',
  FAVORITES: 'exercise-app-favorite-recipes',
  CACHE: 'exercise-app-cached-recipes',
} as const;

/**
 * Recipe Service for managing recipe CRUD operations and localStorage
 */
export const recipeService = {
  /**
   * Get all recipes for a user
   */
  getRecipes(userId: string): Recipe[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!stored) return [];
      
      const recipes: Recipe[] = JSON.parse(stored);
      return recipes.filter(recipe => recipe.userId === userId);
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  },

  /**
   * Get a specific recipe by ID
   */
  getRecipeById(recipeId: string): Recipe | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!stored) return null;
      
      const recipes: Recipe[] = JSON.parse(stored);
      return recipes.find(recipe => recipe.id === recipeId) || null;
    } catch (error) {
      console.error('Error getting recipe by ID:', error);
      return null;
    }
  },

  /**
   * Save a recipe
   */
  saveRecipe(recipe: Recipe): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      const recipes: Recipe[] = stored ? JSON.parse(stored) : [];
      
      // Check if recipe already exists
      const existingIndex = recipes.findIndex(r => r.id === recipe.id);
      
      if (existingIndex >= 0) {
        recipes[existingIndex] = recipe;
      } else {
        recipes.push(recipe);
      }
      
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw new Error('Failed to save recipe');
    }
  },

  /**
   * Delete a recipe
   */
  deleteRecipe(recipeId: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!stored) return;
      
      const recipes: Recipe[] = JSON.parse(stored);
      const filtered = recipes.filter(recipe => recipe.id !== recipeId);
      
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe');
    }
  },

  /**
   * Toggle favorite status of a recipe
   */
  async toggleFavorite(recipeId: string, userId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!stored) return;
      
      const recipes: Recipe[] = JSON.parse(stored);
      const recipe = recipes.find(r => r.id === recipeId && r.userId === userId);
      
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
        
        // Update favorites list
        this.updateFavoritesList(recipe, recipe.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to toggle favorite');
    }
  },

  /**
   * Get all favorite recipes for a user
   */
  getFavorites(userId: string): Recipe[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!stored) return [];
      
      const recipes: Recipe[] = JSON.parse(stored);
      return recipes.filter(recipe => recipe.userId === userId && recipe.isFavorite);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  /**
   * Update favorites list (internal helper)
   */
  updateFavoritesList(recipe: Recipe, isFavorite: boolean): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      let favorites: Recipe[] = stored ? JSON.parse(stored) : [];
      
      if (isFavorite) {
        // Add to favorites if not already there
        if (!favorites.find(r => r.id === recipe.id)) {
          favorites.push(recipe);
        }
      } else {
        // Remove from favorites
        favorites = favorites.filter(r => r.id !== recipe.id);
      }
      
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error updating favorites list:', error);
    }
  },

  /**
   * Get cached recipes
   */
  getCachedRecipes(): Recipe[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CACHE);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting cached recipes:', error);
      return [];
    }
  },

  /**
   * Save recipes to cache
   */
  saveToCache(recipes: Recipe[]): void {
    try {
      // Limit cache size to last 30 recipes (LRU)
      const maxCacheSize = 30;
      const cacheData = recipes.slice(-maxCacheSize);
      
      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
      
      // Also save to main recipes storage
      const existing = localStorage.getItem(STORAGE_KEYS.RECIPES);
      const existingRecipes: Recipe[] = existing ? JSON.parse(existing) : [];
      
      // Merge new recipes with existing ones
      const merged = [...existingRecipes];
      for (const recipe of recipes) {
        const existingIndex = merged.findIndex(r => r.id === recipe.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = recipe;
        } else {
          merged.push(recipe);
        }
      }
      
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(merged));
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old cache');
        this.clearCache();
        // Try again with just the new recipes
        localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(recipes.slice(-20)));
      }
    }
  },

  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CACHE);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};
