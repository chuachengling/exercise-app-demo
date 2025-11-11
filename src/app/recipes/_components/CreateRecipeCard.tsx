'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface CreateRecipeCardProps {
  onGenerateRecipe: (description: string) => Promise<void>;
  isGenerating: boolean;
}

export function CreateRecipeCard({ onGenerateRecipe, isGenerating }: CreateRecipeCardProps) {
  const [description, setDescription] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 CreateRecipeCard: Form submitted');
    console.log('📝 Description:', description.trim());
    console.log('⏳ Is generating:', isGenerating);
    
    if (description.trim() && !isGenerating) {
      console.log('✅ Calling onGenerateRecipe...');
      try {
        await onGenerateRecipe(description.trim());
        console.log('✅ Recipe generation completed successfully');
        setDescription('');
        setShowInput(false);
      } catch (error) {
        console.error('❌ Recipe generation error in CreateRecipeCard:', error);
      }
    } else {
      console.log('⚠️ Cannot generate:', { 
        hasDescription: !!description.trim(), 
        isGenerating 
      });
    }
  };

  if (!showInput) {
    return (
      <div
        onClick={() => setShowInput(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowInput(true);
          }
        }}
        className="
          group relative bg-gradient-to-br from-purple-50 to-pink-50 
          dark:from-purple-900/20 dark:to-pink-900/20
          border-2 border-dashed border-purple-300 dark:border-purple-700
          rounded-xl shadow-md min-h-[400px]
          cursor-pointer transition-all duration-200 ease-in-out
          hover:shadow-lg hover:scale-[1.02] hover:border-purple-400
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          flex flex-col items-center justify-center p-8
        "
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Create Custom Recipe
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-xs">
          Use AI to generate a personalized recipe from your description
        </p>
        
        <div className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium group-hover:bg-purple-700 transition-colors">
          Get Started
        </div>
      </div>
    );
  }

  return (
    <div className="
      relative bg-white dark:bg-gray-800 rounded-xl shadow-md 
      border-2 border-purple-300 dark:border-purple-700
      min-h-[400px] p-6 flex flex-col
    ">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Create Custom Recipe
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1">
          <label 
            htmlFor="recipe-description" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Describe your recipe idea
          </label>
          <textarea
            id="recipe-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g., A high-protein breakfast with eggs and spinach, ready in 15 minutes..."
            className="
              w-full h-32 px-4 py-3 rounded-lg
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              resize-none
            "
            autoFocus
          />
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Be specific! Include ingredients, cooking method, or dietary preferences.
          </p>
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            type="submit"
            disabled={!description.trim() || isGenerating}
            className="
              flex-1 flex items-center justify-center space-x-2 px-4 py-3
              bg-gradient-to-r from-purple-600 to-pink-600
              hover:from-purple-700 hover:to-pink-700
              disabled:from-gray-400 disabled:to-gray-500
              text-white font-semibold rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              disabled:cursor-not-allowed
            "
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Recipe</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setDescription('');
            }}
            disabled={isGenerating}
            className="
              px-4 py-3 text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              rounded-lg font-medium
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
