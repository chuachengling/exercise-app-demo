import { HealthGoalId } from './healthGoals';

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK'
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sodium?: number; // mg
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  mealType: MealType;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Ingredients
  ingredients: Ingredient[];
  
  // Instructions
  instructions: string[];
  
  // Nutrition
  nutrition: NutritionInfo;
  
  // Metadata
  tags: string[];
  healthGoals: HealthGoalId[];
  isFavorite: boolean;
  isAiGenerated: boolean;
  generatedAt?: Date;
  userId: string;
}

export interface GenerateRecipesRequest {
  healthGoals: HealthGoalId[];
  count?: number;
  mealType?: MealType;
  excludeIngredients?: string[];
}

export interface AIServiceResponse {
  success: boolean;
  recipes?: Recipe[];
  error?: string;
  cached?: boolean;
}
