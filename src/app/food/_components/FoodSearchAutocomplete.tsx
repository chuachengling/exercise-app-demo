'use client';

import { useState, useEffect, useRef } from 'react';
import { FoodDatabaseEntry } from '@/lib/types/food';
import foodService from '@/lib/services/foodService';
import { Search, X } from 'lucide-react';

interface FoodSearchAutocompleteProps {
  query: string;
  onSelect: (food: FoodDatabaseEntry) => void;
  onClose: () => void;
}

export default function FoodSearchAutocomplete({ query, onSelect, onClose }: FoodSearchAutocompleteProps) {
  const [results, setResults] = useState<FoodDatabaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchFoods = async () => {
      setIsLoading(true);
      try {
        const foods = await foodService.searchFoods(query);
        setResults(foods);
      } catch (error) {
        console.error('Failed to search foods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (results.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
    >
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Searching...</p>
        </div>
      ) : (
        <div className="py-2">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelect(food)}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{food.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {food.category} • {food.calories} cal
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>P: {food.macros.protein}g</span>
                    <span>C: {food.macros.carbs}g</span>
                    <span>F: {food.macros.fats}g</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {food.defaultPortionSize} {food.defaultPortionUnit}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
