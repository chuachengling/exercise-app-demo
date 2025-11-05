import { FoodEntry, FoodFormData, DailyNutritionStats, DateRange, FoodFilters, MealType, FoodDatabaseEntry } from '@/lib/types/food';
import { COMMON_FOODS } from '@/lib/data/commonFoods';

// localStorage keys
const STORAGE_KEYS = {
  FOOD_ENTRIES: 'food_entries'
};

// Get stored food entries
function getStoredFoodEntries(): FoodEntry[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt)
    }));
  } catch (error) {
    console.error('Error parsing food entries:', error);
    return [];
  }
}

// Save food entries
function saveFoodEntries(entries: FoodEntry[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving food entries:', error);
    throw new Error('Failed to save food entries. Storage may be full.');
  }
}

// Create food entry
export async function createFoodEntry(
  data: FoodFormData, 
  userId: string
): Promise<FoodEntry> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newEntry: FoodEntry = {
    id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    name: data.name,
    mealType: data.mealType,
    portionSize: data.portionSize,
    portionUnit: data.portionUnit,
    calories: data.calories,
    macros: (data.protein !== undefined || data.carbs !== undefined || data.fats !== undefined) ? {
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fats: data.fats || 0
    } : undefined,
    timestamp: new Date(data.timestamp),
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const entries = getStoredFoodEntries();
  entries.push(newEntry);
  saveFoodEntries(entries);
  
  console.log('Food entry created:', newEntry);
  return newEntry;
}

// Get food entries with filters
export async function getFoodEntries(
  userId: string,
  filters?: FoodFilters
): Promise<FoodEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let entries = getStoredFoodEntries().filter(entry => entry.userId === userId);
  
  // Apply filters
  if (filters) {
    if (filters.mealType) {
      entries = entries.filter(entry => entry.mealType === filters.mealType);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(entry => 
        entry.name.toLowerCase().includes(query) ||
        entry.notes?.toLowerCase().includes(query)
      );
    }
    
    if (filters.dateRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= filters.dateRange!.startDate && 
        entry.timestamp <= filters.dateRange!.endDate
      );
    }
  }
  
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Update food entry
export async function updateFoodEntry(
  id: string,
  updates: Partial<FoodFormData>
): Promise<FoodEntry> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const entries = getStoredFoodEntries();
  const entryIndex = entries.findIndex(entry => entry.id === id);
  
  if (entryIndex === -1) {
    throw new Error('Food entry not found');
  }
  
  const updatedEntry: FoodEntry = {
    ...entries[entryIndex],
    name: updates.name ?? entries[entryIndex].name,
    mealType: updates.mealType ?? entries[entryIndex].mealType,
    portionSize: updates.portionSize ?? entries[entryIndex].portionSize,
    portionUnit: updates.portionUnit ?? entries[entryIndex].portionUnit,
    calories: updates.calories ?? entries[entryIndex].calories,
    macros: (updates.protein !== undefined || updates.carbs !== undefined || updates.fats !== undefined) ? {
      protein: updates.protein ?? entries[entryIndex].macros?.protein ?? 0,
      carbs: updates.carbs ?? entries[entryIndex].macros?.carbs ?? 0,
      fats: updates.fats ?? entries[entryIndex].macros?.fats ?? 0
    } : entries[entryIndex].macros,
    timestamp: updates.timestamp ? new Date(updates.timestamp) : entries[entryIndex].timestamp,
    notes: updates.notes ?? entries[entryIndex].notes,
    updatedAt: new Date()
  };
  
  entries[entryIndex] = updatedEntry;
  saveFoodEntries(entries);
  
  console.log('Food entry updated:', updatedEntry);
  return updatedEntry;
}

// Delete food entry
export async function deleteFoodEntry(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const entries = getStoredFoodEntries();
  const filteredEntries = entries.filter(entry => entry.id !== id);
  
  if (entries.length === filteredEntries.length) {
    throw new Error('Food entry not found');
  }
  
  saveFoodEntries(filteredEntries);
  console.log('Food entry deleted:', id);
}

// Calculate daily statistics
export async function getDailyStats(
  userId: string,
  date: Date
): Promise<DailyNutritionStats> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const entries = await getFoodEntries(userId, {
    dateRange: {
      startDate: startOfDay,
      endDate: endOfDay
    }
  });
  
  const stats: DailyNutritionStats = {
    date,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: entries.length,
    entriesByMealType: {
      [MealType.BREAKFAST]: [],
      [MealType.LUNCH]: [],
      [MealType.DINNER]: [],
      [MealType.SNACK]: []
    }
  };
  
  entries.forEach(entry => {
    stats.totalCalories += entry.calories;
    stats.entriesByMealType[entry.mealType].push(entry);
    
    if (entry.macros) {
      stats.totalProtein += entry.macros.protein;
      stats.totalCarbs += entry.macros.carbs;
      stats.totalFats += entry.macros.fats;
    }
  });
  
  return stats;
}

// Search common foods
export async function searchFoods(query: string): Promise<FoodDatabaseEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (!query || query.trim() === '') {
    return COMMON_FOODS.slice(0, 10); // Return first 10 if no query
  }
  
  const searchTerm = query.toLowerCase();
  return COMMON_FOODS.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.category.toLowerCase().includes(searchTerm)
  );
}

// Export default service object
const foodService = {
  createFoodEntry,
  getFoodEntries,
  updateFoodEntry,
  deleteFoodEntry,
  getDailyStats,
  searchFoods
};

export default foodService;
