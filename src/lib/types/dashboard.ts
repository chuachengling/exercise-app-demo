export interface TimeRange {
  label: string;
  value: 'week' | 'month' | 'quarter' | 'year';
  days: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface HealthDataPoint {
  date: Date;
  exerciseMinutes: number;
  caloriesConsumed: number;
  waterIntake: number; // in liters
  weight?: number; // in kg
}

export interface HealthMetrics {
  totalExerciseSessions: number;
  averageDailyWater: number;
  nutritionTrackingStreak: number;
  goalCompletionPercentage: number;
}

export interface ChartDataPoint {
  date: string;
  exercise: number;
  nutrition: number;
  hydration: number;
  weight?: number;
}

export interface SummaryMetrics {
  currentPeriod: HealthMetrics;
  previousPeriod: HealthMetrics;
  percentageChanges: Record<keyof HealthMetrics, number>;
}

export interface DashboardState {
  // UI States
  isLoading: boolean;
  selectedTimeRange: TimeRange;
  chartType: 'overview' | 'exercise' | 'nutrition' | 'hydration';
  
  // Data States
  healthData: HealthDataPoint[];
  summaryMetrics: SummaryMetrics | null;
  chartData: ChartDataPoint[];
  
  // Filter States
  dateRange: DateRange;
  refreshTimestamp: Date;
}

export interface DataFilter {
  type: string;
  value: any;
  enabled: boolean;
}