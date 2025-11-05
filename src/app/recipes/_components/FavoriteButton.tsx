'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
}

export function FavoriteButton({ isFavorite, onToggle, className = '' }: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={`
        group relative p-2 rounded-full
        transition-all duration-200 ease-in-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
      ) : (
        <Heart
          className={`
            w-6 h-6 transition-all duration-200
            ${isFavorite 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 group-hover:text-red-500'
            }
          `}
        />
      )}
      
      {/* Tooltip */}
      <span className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none whitespace-nowrap
      ">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </button>
  );
}
