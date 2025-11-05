'use client';

import { ChevronDown } from 'lucide-react';
import { MealType } from '@/lib/types/recipe';
import { useState, useRef, useEffect } from 'react';

interface RecipeFiltersProps {
  activeFilter: MealType | 'all';
  onFilterChange: (filter: MealType | 'all') => void;
  recipeCount: number;
  className?: string;
}

const filterOptions: { value: MealType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Recipes', icon: '🍽️' },
  { value: MealType.BREAKFAST, label: 'Breakfast', icon: '🌅' },
  { value: MealType.LUNCH, label: 'Lunch', icon: '🌮' },
  { value: MealType.DINNER, label: 'Dinner', icon: '🍽️' },
  { value: MealType.SNACK, label: 'Snacks', icon: '🍿' },
];

export function RecipeFilters({ activeFilter, onFilterChange, recipeCount, className = '' }: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = filterOptions.find(opt => opt.value === activeFilter) || filterOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: MealType | 'all') => {
    onFilterChange(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center space-x-3 px-4 py-2.5 
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          transition-colors duration-200
        "
        aria-label="Filter recipes by meal type"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{activeOption.icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {activeOption.label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          ({recipeCount})
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-56 
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg 
          py-1 z-10
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full flex items-center space-x-3 px-4 py-2.5
                text-left text-sm
                transition-colors duration-150
                ${activeFilter === option.value
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="flex-1 font-medium">{option.label}</span>
              {activeFilter === option.value && (
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {recipeCount > 0 
          ? `Showing ${recipeCount} ${activeOption.label.toLowerCase()}`
          : `No ${activeOption.label.toLowerCase()} found`
        }
      </div>
    </div>
  );
}
