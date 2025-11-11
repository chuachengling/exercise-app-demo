// Water tracking types

export enum WaterUnit {
  ML = 'ml',
  OZ = 'oz',
  CUPS = 'cups',
  LITERS = 'liters'
}

export interface WaterEntry {
  id: string;
  userId: string;
  amount: number;              // Always stored in ml
  unit: WaterUnit;             // User's preferred unit for display
  timestamp: Date;
  notes?: string;
  presetType?: string;         // e.g., 'glass', 'bottle', 'large_bottle'
  createdAt: Date;
  updatedAt: Date;
}

export interface WaterPreset {
  id: string;
  name: string;
  amount: number;              // in ml
  icon: string;                // Icon name or emoji
  displayUnit: WaterUnit;
  color?: string;
}

export interface DailyWaterStats {
  date: Date;
  totalAmount: number;         // in ml
  goalAmount: number;          // in ml
  percentage: number;
  entryCount: number;
  entries: WaterEntry[];
  hourlyDistribution: { hour: number; amount: number }[];
}

export interface WaterGoal {
  userId: string;
  dailyGoalMl: number;
  unit: WaterUnit;
  reminderEnabled: boolean;
  reminderIntervalHours?: number;
}

export interface WaterFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  minAmount?: number;
  maxAmount?: number;
}

export interface WaterFormData {
  amount: number;
  unit: WaterUnit;
  notes?: string;
  presetType?: string;
}
