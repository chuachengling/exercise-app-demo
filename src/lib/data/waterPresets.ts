import { WaterPreset, WaterUnit } from '@/lib/types/water';

// Common water container presets
export const WATER_PRESETS: WaterPreset[] = [
  {
    id: 'preset_glass',
    name: 'Small Glass',
    amount: 250, // ml
    icon: '🥤',
    displayUnit: WaterUnit.ML,
    color: 'bg-blue-500'
  },
  {
    id: 'preset_bottle',
    name: 'Water Bottle',
    amount: 500, // ml
    icon: '💧',
    displayUnit: WaterUnit.ML,
    color: 'bg-cyan-500'
  },
  {
    id: 'preset_large_bottle',
    name: 'Large Bottle',
    amount: 750, // ml
    icon: '🍶',
    displayUnit: WaterUnit.ML,
    color: 'bg-blue-600'
  },
  {
    id: 'preset_xl_bottle',
    name: 'Extra Large',
    amount: 1000, // ml (1 liter)
    icon: '🧴',
    displayUnit: WaterUnit.LITERS,
    color: 'bg-cyan-600'
  }
];

// Default daily water goal (2 liters = 2000ml)
export const DEFAULT_WATER_GOAL_ML = 2000;

// Unit conversion factors (to ml)
export const UNIT_CONVERSIONS = {
  [WaterUnit.ML]: 1,
  [WaterUnit.OZ]: 29.5735,
  [WaterUnit.CUPS]: 236.588,
  [WaterUnit.LITERS]: 1000
};

// Validation constants
export const WATER_VALIDATION = {
  MIN_AMOUNT_ML: 1,
  MAX_AMOUNT_ML: 5000,
  MIN_GOAL_ML: 500,
  MAX_GOAL_ML: 10000
};
