import { 
  WaterEntry, 
  WaterFormData, 
  WaterUnit, 
  WaterGoal, 
  DailyWaterStats, 
  WaterFilters 
} from '@/lib/types/water';
import { DEFAULT_WATER_GOAL_ML, UNIT_CONVERSIONS, WATER_VALIDATION } from '@/lib/data/waterPresets';

// Storage keys
const STORAGE_KEYS = {
  WATER_ENTRIES: 'water_entries',
  WATER_GOALS: 'water_goals'
};

// Utility functions for local storage
function getStoredWaterEntries(): WaterEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WATER_ENTRIES);
    if (!stored) return [];
    
    const entries = JSON.parse(stored);
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt)
    }));
  } catch (error) {
    console.error('Error parsing water entries:', error);
    return [];
  }
}

function saveWaterEntries(entries: WaterEntry[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving water entries:', error);
    throw new Error('Failed to save water entries. Storage may be full.');
  }
}

function getStoredWaterGoals(): Record<string, WaterGoal> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WATER_GOALS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error parsing water goals:', error);
    return {};
  }
}

function saveWaterGoals(goals: Record<string, WaterGoal>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving water goals:', error);
    throw new Error('Failed to save water goals.');
  }
}

// Unit conversion functions
export function convertUnit(amount: number, fromUnit: WaterUnit, toUnit: WaterUnit): number {
  // Convert to ml first
  const amountInMl = amount * UNIT_CONVERSIONS[fromUnit];
  // Convert from ml to target unit
  return amountInMl / UNIT_CONVERSIONS[toUnit];
}

export function formatWaterAmount(amountMl: number, unit: WaterUnit): string {
  const converted = convertUnit(amountMl, WaterUnit.ML, unit);
  const rounded = Math.round(converted * 10) / 10; // Round to 1 decimal
  
  switch (unit) {
    case WaterUnit.ML:
      return `${Math.round(rounded)} ml`;
    case WaterUnit.OZ:
      return `${rounded} oz`;
    case WaterUnit.CUPS:
      return `${rounded} cups`;
    case WaterUnit.LITERS:
      return `${rounded} L`;
    default:
      return `${rounded} ${unit}`;
  }
}

// Calculate recommended goal based on weight (optional)
export function calculateRecommendedGoal(weightKg: number): number {
  // Recommended: 30-40ml per kg body weight
  return Math.round(weightKg * 35);
}

// Create water entry
export async function createWaterEntry(
  data: WaterFormData,
  userId: string
): Promise<WaterEntry> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Convert amount to ml for storage
  const amountInMl = convertUnit(data.amount, data.unit, WaterUnit.ML);
  
  // Validate amount
  if (amountInMl < WATER_VALIDATION.MIN_AMOUNT_ML || amountInMl > WATER_VALIDATION.MAX_AMOUNT_ML) {
    throw new Error(`Amount must be between ${WATER_VALIDATION.MIN_AMOUNT_ML}ml and ${WATER_VALIDATION.MAX_AMOUNT_ML}ml`);
  }
  
  const newEntry: WaterEntry = {
    id: `water_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount: amountInMl,
    unit: data.unit,
    timestamp: new Date(),
    notes: data.notes?.trim(),
    presetType: data.presetType,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const entries = getStoredWaterEntries();
  entries.unshift(newEntry); // Add to beginning
  saveWaterEntries(entries);
  
  return newEntry;
}

// Get water entries
export async function getWaterEntries(
  userId: string,
  filters?: WaterFilters
): Promise<WaterEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let entries = getStoredWaterEntries().filter(entry => entry.userId === userId);
  
  // Apply filters
  if (filters?.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    entries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }
  
  if (filters?.minAmount !== undefined) {
    entries = entries.filter(entry => entry.amount >= filters.minAmount!);
  }
  
  if (filters?.maxAmount !== undefined) {
    entries = entries.filter(entry => entry.amount <= filters.maxAmount!);
  }
  
  return entries;
}

// Get daily stats
export async function getDailyStats(
  userId: string,
  date: Date
): Promise<DailyWaterStats> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const entries = await getWaterEntries(userId, {
    dateRange: { startDate: startOfDay, endDate: endOfDay }
  });
  
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const goal = await getWaterGoal(userId);
  const percentage = (totalAmount / goal.dailyGoalMl) * 100;
  
  // Calculate hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    amount: 0
  }));
  
  entries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    hourlyDistribution[hour].amount += entry.amount;
  });
  
  return {
    date: startOfDay,
    totalAmount,
    goalAmount: goal.dailyGoalMl,
    percentage: Math.round(percentage),
    entryCount: entries.length,
    entries,
    hourlyDistribution
  };
}

// Get weekly stats
export async function getWeeklyStats(
  userId: string,
  startDate: Date
): Promise<DailyWaterStats[]> {
  const stats: DailyWaterStats[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dailyStats = await getDailyStats(userId, date);
    stats.push(dailyStats);
  }
  
  return stats;
}

// Update water entry
export async function updateWaterEntry(
  id: string,
  updates: Partial<WaterFormData>
): Promise<WaterEntry> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const entries = getStoredWaterEntries();
  const index = entries.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    throw new Error('Water entry not found');
  }
  
  const entry = entries[index];
  
  // Update amount if provided
  if (updates.amount !== undefined && updates.unit !== undefined) {
    const amountInMl = convertUnit(updates.amount, updates.unit, WaterUnit.ML);
    
    if (amountInMl < WATER_VALIDATION.MIN_AMOUNT_ML || amountInMl > WATER_VALIDATION.MAX_AMOUNT_ML) {
      throw new Error(`Amount must be between ${WATER_VALIDATION.MIN_AMOUNT_ML}ml and ${WATER_VALIDATION.MAX_AMOUNT_ML}ml`);
    }
    
    entry.amount = amountInMl;
    entry.unit = updates.unit;
  }
  
  // Update notes if provided
  if (updates.notes !== undefined) {
    entry.notes = updates.notes.trim() || undefined;
  }
  
  entry.updatedAt = new Date();
  
  entries[index] = entry;
  saveWaterEntries(entries);
  
  return entry;
}

// Delete water entry
export async function deleteWaterEntry(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const entries = getStoredWaterEntries();
  const filtered = entries.filter(entry => entry.id !== id);
  
  if (filtered.length === entries.length) {
    throw new Error('Water entry not found');
  }
  
  saveWaterEntries(filtered);
}

// Get water goal
export async function getWaterGoal(userId: string): Promise<WaterGoal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const goals = getStoredWaterGoals();
  
  if (goals[userId]) {
    return goals[userId];
  }
  
  // Return default goal
  return {
    userId,
    dailyGoalMl: DEFAULT_WATER_GOAL_ML,
    unit: WaterUnit.ML,
    reminderEnabled: false
  };
}

// Update water goal
export async function updateWaterGoal(
  userId: string,
  updates: Partial<Omit<WaterGoal, 'userId'>>
): Promise<WaterGoal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const goals = getStoredWaterGoals();
  const currentGoal = goals[userId] || {
    userId,
    dailyGoalMl: DEFAULT_WATER_GOAL_ML,
    unit: WaterUnit.ML,
    reminderEnabled: false
  };
  
  // Validate goal amount if provided
  if (updates.dailyGoalMl !== undefined) {
    if (updates.dailyGoalMl < WATER_VALIDATION.MIN_GOAL_ML || 
        updates.dailyGoalMl > WATER_VALIDATION.MAX_GOAL_ML) {
      throw new Error(`Goal must be between ${WATER_VALIDATION.MIN_GOAL_ML}ml and ${WATER_VALIDATION.MAX_GOAL_ML}ml`);
    }
  }
  
  const updatedGoal: WaterGoal = {
    ...currentGoal,
    ...updates
  };
  
  goals[userId] = updatedGoal;
  saveWaterGoals(goals);
  
  return updatedGoal;
}

// Default export
const waterService = {
  createWaterEntry,
  getWaterEntries,
  getDailyStats,
  getWeeklyStats,
  updateWaterEntry,
  deleteWaterEntry,
  getWaterGoal,
  updateWaterGoal,
  convertUnit,
  formatWaterAmount,
  calculateRecommendedGoal
};

export default waterService;
