'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Recipe, MealType } from '@/lib/types/recipe';
import { HealthGoalId } from '@/lib/types/healthGoals';
import { aiService } from '@/lib/services/aiService';
import { recipeService } from '@/lib/services/recipeService';
import { fallbackRecipes } from '@/lib/data/cachedRecipes';

interface RecipesState {
  isLoading: boolean;
  isRefreshing: boolean;
  isGenerating: boolean;
  selectedRecipe: Recipe | null;
  showDetail: boolean;
  activeFilter: MealType | 'all';
  recipes: Recipe[];
  favoriteRecipes: Recipe[];
  error: string | null;
  generationProgress: string;
  streamingChunks: string[];
}

interface UseRecipesReturn extends RecipesState {
  isOnline: boolean;
  filteredRecipes: Recipe[];
  refreshRecipes: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  setFilter: (filter: MealType | 'all') => void;
  selectRecipe: (recipe: Recipe) => void;
  closeRecipe: () => void;
  generateNewRecipes: () => Promise<void>;
  generateCustomRecipe: (description: string) => Promise<void>;
  clearError: () => void;
}

export function useRecipes(userId: string, healthGoals: HealthGoalId[]): UseRecipesReturn {
  const [state, setState] = useState<RecipesState>({
    isLoading: true,
    isRefreshing: false,
    isGenerating: false,
    selectedRecipe: null,
    showDetail: false,
    activeFilter: 'all',
    recipes: [],
    favoriteRecipes: [],
    error: null,
    generationProgress: '',
    streamingChunks: [],
  });

  // Check online status - start with true to avoid hydration mismatch
  const [isOnline, setIsOnline] = useState(true);

  // Set actual online status after hydration
  useEffect(() => {
    // Set initial online status after mount
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial recipes
  useEffect(() => {
    if (userId) {
      loadInitialRecipes();
    }
  }, [userId]);

  const loadInitialRecipes = async () => {
    try {
      // Detect available AI provider in background
      if (isOnline) {
        aiService.detectAndSetProvider().then(provider => {
          console.log('AI Provider detected:', provider || 'none');
        }).catch(err => {
          console.warn('Provider detection failed:', err);
        });
      }

      // Always load fallback recipes immediately for fast page load
      console.log('Loading recipe database:', fallbackRecipes.length, 'recipes');
      
      // Check if we have user-generated custom recipes in cache
      const cachedCustomRecipes = recipeService.getCachedRecipes().filter(r => r.isAiGenerated);
      
      // Combine fallback recipes with any custom generated ones
      const allRecipes = [...fallbackRecipes, ...cachedCustomRecipes];
      
      setState(prev => ({
        ...prev,
        recipes: allRecipes,
        isLoading: false,
      }));
      
      console.log('Loaded', allRecipes.length, 'total recipes (', cachedCustomRecipes.length, 'custom)');
    } catch (error) {
      console.error('Failed to load recipes:', error);
      loadFallbackRecipes();
    }
  };

  const loadFallbackRecipes = () => {
    setState(prev => ({
      ...prev,
      recipes: fallbackRecipes,
      isLoading: false,
      isGenerating: false,
    }));
  };

  const generateNewRecipes = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, generationProgress: '', streamingChunks: [] }));

    try {
      // Progress callback for Ollama streaming
      const onProgress = (chunk: string) => {
        setState(prev => ({
          ...prev,
          generationProgress: prev.generationProgress + chunk,
          streamingChunks: [...prev.streamingChunks, chunk],
        }));
      };

      const response = await aiService.generateRecipes(
        { healthGoals, count: 9 },
        userId,
        onProgress
      );

      if (response.success && response.recipes) {
        // Save to cache
        recipeService.saveToCache(response.recipes);
        
        setState(prev => ({
          ...prev,
          recipes: response.recipes!,
          isGenerating: false,
          isLoading: false,
          generationProgress: '',
          streamingChunks: [],
        }));
      } else {
        throw new Error(response.error || 'Failed to generate recipes');
      }
    } catch (error) {
      console.error('Recipe generation failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to generate recipes. Loading cached recipes.',
        isGenerating: false,
        generationProgress: '',
        streamingChunks: [],
      }));
      loadFallbackRecipes();
    }
  }, [healthGoals, userId, isOnline]);

  const generateCustomRecipe = useCallback(async (description: string) => {
    console.log('🚀 Starting custom recipe generation...');
    console.log('📝 Description:', description);
    console.log('👤 User ID:', userId);
    console.log('🎯 Health Goals:', healthGoals);
    
    setState(prev => ({ ...prev, isGenerating: true, error: null, generationProgress: '', streamingChunks: [] }));

    try {
      // Progress callback for Ollama streaming
      const onProgress = (chunk: string) => {
        console.log('📊 Progress chunk received');
        setState(prev => ({
          ...prev,
          generationProgress: prev.generationProgress + chunk,
          streamingChunks: [...prev.streamingChunks, chunk],
        }));
      };

      console.log('📡 Calling aiService.generateRecipes...');
      
      // Generate a single custom recipe based on user description
      const response = await aiService.generateRecipes(
        { 
          healthGoals, 
          count: 1,
          customPrompt: description // Pass the custom description
        },
        userId,
        onProgress
      );

      console.log('📥 Response received:', response);

      if (response.success && response.recipes && response.recipes.length > 0) {
        const newRecipe = response.recipes[0];
        
        console.log('✅ Recipe generated successfully:', newRecipe.title);
        console.log('🖼️  Image URL:', newRecipe.image);
        
        // Save to cache
        recipeService.saveRecipe(newRecipe);
        
        // Add to current recipes list
        setState(prev => ({
          ...prev,
          recipes: [newRecipe, ...prev.recipes], // Add at the beginning
          isGenerating: false,
          generationProgress: '',
          streamingChunks: [],
        }));
        
        console.log('✅ Custom recipe added to list');
      } else {
        console.error('❌ Response not successful or no recipes:', response);
        throw new Error(response.error || 'Failed to generate custom recipe');
      }
    } catch (error) {
      console.error('❌ Custom recipe generation failed:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      setState(prev => ({
        ...prev,
        error: 'Failed to generate custom recipe. Please try again.',
        isGenerating: false,
        generationProgress: '',
        streamingChunks: [],
      }));
    }
  }, [healthGoals, userId]);

  const refreshRecipes = useCallback(async () => {
    if (!isOnline) {
      setState(prev => ({
        ...prev,
        error: 'Cannot refresh while offline',
      }));
      return;
    }

    setState(prev => ({ ...prev, isRefreshing: true }));
    await generateNewRecipes();
    setState(prev => ({ ...prev, isRefreshing: false }));
  }, [isOnline, generateNewRecipes]);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    try {
      await recipeService.toggleFavorite(recipeId, userId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        recipes: prev.recipes.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, isFavorite: !recipe.isFavorite }
            : recipe
        ),
        selectedRecipe: prev.selectedRecipe?.id === recipeId
          ? { ...prev.selectedRecipe, isFavorite: !prev.selectedRecipe.isFavorite }
          : prev.selectedRecipe,
      }));

      // Reload favorites
      const favorites = recipeService.getFavorites(userId);
      setState(prev => ({ ...prev, favoriteRecipes: favorites }));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update favorite status',
      }));
    }
  }, [userId]);

  const setFilter = useCallback((filter: MealType | 'all') => {
    setState(prev => ({ ...prev, activeFilter: filter }));
  }, []);

  const selectRecipe = useCallback((recipe: Recipe) => {
    setState(prev => ({
      ...prev,
      selectedRecipe: recipe,
      showDetail: true,
    }));
  }, []);

  const closeRecipe = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedRecipe: null,
      showDetail: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Filter recipes based on active filter
  const filteredRecipes = useMemo(() => {
    if (state.activeFilter === 'all') {
      return state.recipes;
    }
    return state.recipes.filter(recipe => recipe.mealType === state.activeFilter);
  }, [state.recipes, state.activeFilter]);

  return {
    ...state,
    isOnline,
    filteredRecipes,
    refreshRecipes,
    toggleFavorite,
    setFilter,
    selectRecipe,
    closeRecipe,
    generateNewRecipes,
    generateCustomRecipe,
    clearError,
  };
}
