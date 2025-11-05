export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK'
}

export enum PortionUnit {
  GRAMS = 'g',
  OUNCES = 'oz',
  CUPS = 'cup',
  PIECES = 'piece',
  SERVINGS = 'serving',
  TABLESPOONS = 'tbsp',
  TEASPOONS = 'tsp',
  MILLILITERS = 'ml'
}

export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  mealType: MealType;
  portionSize: number;
  portionUnit: PortionUnit;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  timestamp: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodFormData {
  name: string;
  mealType: MealType;
  portionSize: number;
  portionUnit: PortionUnit;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  timestamp: string;
  notes?: string;
}

export interface FoodDatabaseEntry {
  id: string;
  name: string;
  brand?: string;
  category: string;
  defaultPortionSize: number;
  defaultPortionUnit: PortionUnit;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface DailyNutritionStats {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealCount: number;
  entriesByMealType: Record<MealType, FoodEntry[]>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FoodFilters {
  mealType?: MealType;
  searchQuery?: string;
  dateRange?: DateRange;
}
