import { FoodDatabaseEntry, PortionUnit } from '@/lib/types/food';

export const COMMON_FOODS: FoodDatabaseEntry[] = [
  // Fruits
  {
    id: 'cf_001',
    name: 'Banana',
    category: 'Fruit',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 105,
    macros: { protein: 1.3, carbs: 27, fats: 0.4 }
  },
  {
    id: 'cf_002',
    name: 'Apple',
    category: 'Fruit',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 95,
    macros: { protein: 0.5, carbs: 25, fats: 0.3 }
  },
  {
    id: 'cf_003',
    name: 'Orange',
    category: 'Fruit',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 62,
    macros: { protein: 1.2, carbs: 15, fats: 0.2 }
  },
  {
    id: 'cf_004',
    name: 'Strawberries',
    category: 'Fruit',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 49,
    macros: { protein: 1, carbs: 12, fats: 0.5 }
  },
  {
    id: 'cf_005',
    name: 'Blueberries',
    category: 'Fruit',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 84,
    macros: { protein: 1.1, carbs: 21, fats: 0.5 }
  },

  // Proteins
  {
    id: 'cf_006',
    name: 'Chicken Breast',
    category: 'Protein',
    defaultPortionSize: 100,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 165,
    macros: { protein: 31, carbs: 0, fats: 3.6 }
  },
  {
    id: 'cf_007',
    name: 'Salmon',
    category: 'Protein',
    defaultPortionSize: 100,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 208,
    macros: { protein: 20, carbs: 0, fats: 13 }
  },
  {
    id: 'cf_008',
    name: 'Eggs',
    category: 'Protein',
    defaultPortionSize: 2,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 143,
    macros: { protein: 12.6, carbs: 0.7, fats: 9.5 }
  },
  {
    id: 'cf_009',
    name: 'Greek Yogurt',
    category: 'Protein',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 130,
    macros: { protein: 17, carbs: 9, fats: 0.4 }
  },
  {
    id: 'cf_010',
    name: 'Tofu',
    category: 'Protein',
    defaultPortionSize: 100,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 76,
    macros: { protein: 8, carbs: 1.9, fats: 4.8 }
  },

  // Grains
  {
    id: 'cf_011',
    name: 'Brown Rice',
    category: 'Grains',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 218,
    macros: { protein: 5, carbs: 45, fats: 1.6 }
  },
  {
    id: 'cf_012',
    name: 'Oatmeal',
    category: 'Grains',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 166,
    macros: { protein: 5.9, carbs: 28, fats: 3.6 }
  },
  {
    id: 'cf_013',
    name: 'Whole Wheat Bread',
    category: 'Grains',
    defaultPortionSize: 2,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 160,
    macros: { protein: 8, carbs: 28, fats: 2 }
  },
  {
    id: 'cf_014',
    name: 'Quinoa',
    category: 'Grains',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 222,
    macros: { protein: 8, carbs: 39, fats: 3.6 }
  },
  {
    id: 'cf_015',
    name: 'Pasta',
    category: 'Grains',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 221,
    macros: { protein: 8, carbs: 43, fats: 1.3 }
  },

  // Vegetables
  {
    id: 'cf_016',
    name: 'Broccoli',
    category: 'Vegetable',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 31,
    macros: { protein: 2.6, carbs: 6, fats: 0.3 }
  },
  {
    id: 'cf_017',
    name: 'Spinach',
    category: 'Vegetable',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 7,
    macros: { protein: 0.9, carbs: 1.1, fats: 0.1 }
  },
  {
    id: 'cf_018',
    name: 'Carrots',
    category: 'Vegetable',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 52,
    macros: { protein: 1.2, carbs: 12, fats: 0.3 }
  },
  {
    id: 'cf_019',
    name: 'Sweet Potato',
    category: 'Vegetable',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 112,
    macros: { protein: 2, carbs: 26, fats: 0.1 }
  },
  {
    id: 'cf_020',
    name: 'Bell Pepper',
    category: 'Vegetable',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.PIECES,
    calories: 31,
    macros: { protein: 1, carbs: 7, fats: 0.2 }
  },

  // Dairy
  {
    id: 'cf_021',
    name: 'Milk',
    category: 'Dairy',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 149,
    macros: { protein: 8, carbs: 12, fats: 8 }
  },
  {
    id: 'cf_022',
    name: 'Cheese',
    category: 'Dairy',
    defaultPortionSize: 28,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 113,
    macros: { protein: 7, carbs: 1, fats: 9 }
  },
  {
    id: 'cf_023',
    name: 'Cottage Cheese',
    category: 'Dairy',
    defaultPortionSize: 1,
    defaultPortionUnit: PortionUnit.CUPS,
    calories: 163,
    macros: { protein: 28, carbs: 6, fats: 2.3 }
  },

  // Nuts & Seeds
  {
    id: 'cf_024',
    name: 'Almonds',
    category: 'Nuts',
    defaultPortionSize: 28,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 164,
    macros: { protein: 6, carbs: 6, fats: 14 }
  },
  {
    id: 'cf_025',
    name: 'Peanut Butter',
    category: 'Nuts',
    defaultPortionSize: 2,
    defaultPortionUnit: PortionUnit.TABLESPOONS,
    calories: 188,
    macros: { protein: 8, carbs: 7, fats: 16 }
  },
  {
    id: 'cf_026',
    name: 'Walnuts',
    category: 'Nuts',
    defaultPortionSize: 28,
    defaultPortionUnit: PortionUnit.GRAMS,
    calories: 185,
    macros: { protein: 4.3, carbs: 3.9, fats: 18.5 }
  }
];

export const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack'
};

export const PORTION_UNIT_LABELS: Record<string, string> = {
  g: 'grams',
  oz: 'ounces',
  cup: 'cups',
  piece: 'pieces',
  serving: 'servings',
  tbsp: 'tablespoons',
  tsp: 'teaspoons',
  ml: 'milliliters'
};
