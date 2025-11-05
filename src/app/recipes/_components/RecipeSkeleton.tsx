export function RecipeSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        </div>
        
        {/* Metadata row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            {/* Time badge */}
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
            {/* Calories badge */}
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>
          
          {/* Favorite button */}
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        
        {/* Difficulty badge */}
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

export function RecipeSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RecipeSkeleton key={index} />
      ))}
    </div>
  );
}
