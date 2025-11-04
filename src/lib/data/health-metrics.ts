import { HealthDataPoint, HealthMetrics, ChartDataPoint, SummaryMetrics, DateRange } from '@/lib/types/dashboard';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, eachDayOfInterval, subDays, format } from 'date-fns';

// Mock data generation utilities
export function generateMockHealthData(dateRange: DateRange): HealthDataPoint[] {
  const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate });
  
  return days.map((date: Date, index: number) => {
    // Generate somewhat realistic patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Exercise tends to be higher on weekends for some people
    const baseExercise = isWeekend ? 45 : 30;
    const exerciseVariation = Math.random() * 30 - 15; // ±15 minutes
    
    // Calories tend to be higher on weekends
    const baseCalories = isWeekend ? 2100 : 1950;
    const calorieVariation = Math.random() * 400 - 200; // ±200 calories
    
    // Water intake is generally consistent
    const baseWater = 2.2; // 2.2 liters
    const waterVariation = Math.random() * 0.6 - 0.3; // ±0.3 liters
    
    // Weight fluctuates slightly
    const baseWeight = 70 + Math.sin(index * 0.1) * 2; // Gentle wave pattern
    const weightVariation = Math.random() * 1 - 0.5; // ±0.5 kg
    
    return {
      date,
      exerciseMinutes: Math.max(0, Math.round(baseExercise + exerciseVariation)),
      caloriesConsumed: Math.round(baseCalories + calorieVariation),
      waterIntake: Math.max(0.5, Number((baseWater + waterVariation).toFixed(1))),
      weight: Number((baseWeight + weightVariation).toFixed(1))
    };
  });
}

export function calculateHealthMetrics(data: HealthDataPoint[]): HealthMetrics {
  if (data.length === 0) {
    return {
      totalExerciseSessions: 0,
      averageDailyWater: 0,
      nutritionTrackingStreak: 0,
      goalCompletionPercentage: 0
    };
  }
  
  // Calculate exercise sessions (days with >0 minutes)
  const totalExerciseSessions = data.filter(d => d.exerciseMinutes > 0).length;
  
  // Calculate average daily water intake
  const averageDailyWater = Number(
    (data.reduce((sum, d) => sum + d.waterIntake, 0) / data.length).toFixed(1)
  );
  
  // Mock nutrition tracking streak (consecutive days with calorie data)
  let nutritionTrackingStreak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].caloriesConsumed > 0) {
      nutritionTrackingStreak++;
    } else {
      break;
    }
  }
  
  // Mock goal completion percentage based on activity
  const averageExercise = data.reduce((sum, d) => sum + d.exerciseMinutes, 0) / data.length;
  const exerciseGoalCompletion = Math.min(100, (averageExercise / 30) * 100); // 30 min goal
  
  const waterGoalCompletion = Math.min(100, (averageDailyWater / 2.0) * 100); // 2L goal
  
  const goalCompletionPercentage = Math.round((exerciseGoalCompletion + waterGoalCompletion) / 2);
  
  return {
    totalExerciseSessions,
    averageDailyWater,
    nutritionTrackingStreak,
    goalCompletionPercentage
  };
}

export function transformToChartData(data: HealthDataPoint[]): ChartDataPoint[] {
  return data.map(point => ({
    date: format(point.date, 'MMM dd'),
    exercise: point.exerciseMinutes,
    nutrition: Math.round(point.caloriesConsumed / 100), // Scale down for chart readability
    hydration: point.waterIntake,
    weight: point.weight
  }));
}

// Time range utilities
export function getDateRangeForPeriod(period: 'week' | 'month' | 'quarter' | 'year', baseDate: Date = new Date()): DateRange {
  switch (period) {
    case 'week':
      return {
        startDate: startOfWeek(baseDate),
        endDate: endOfWeek(baseDate)
      };
    case 'month':
      return {
        startDate: startOfMonth(baseDate),
        endDate: endOfMonth(baseDate)
      };
    case 'quarter':
      return {
        startDate: startOfQuarter(baseDate),
        endDate: endOfQuarter(baseDate)
      };
    case 'year':
      return {
        startDate: startOfYear(baseDate),
        endDate: endOfYear(baseDate)
      };
    default:
      return {
        startDate: startOfWeek(baseDate),
        endDate: endOfWeek(baseDate)
      };
  }
}

export function getPreviousPeriodRange(period: 'week' | 'month' | 'quarter' | 'year', currentRange: DateRange): DateRange {
  const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime();
  const daysInPeriod = Math.ceil(duration / (1000 * 60 * 60 * 24));
  
  return {
    startDate: subDays(currentRange.startDate, daysInPeriod),
    endDate: subDays(currentRange.endDate, daysInPeriod)
  };
}

export async function getHealthMetrics(dateRange: DateRange): Promise<SummaryMetrics> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Generate current period data
  const currentData = generateMockHealthData(dateRange);
  const currentMetrics = calculateHealthMetrics(currentData);
  
  // Generate previous period data for comparison
  const previousRange = getPreviousPeriodRange('week', dateRange); // Default to week for comparison
  const previousData = generateMockHealthData(previousRange);
  const previousMetrics = calculateHealthMetrics(previousData);
  
  // Calculate percentage changes
  const percentageChanges: Record<keyof HealthMetrics, number> = {
    totalExerciseSessions: calculatePercentageChange(
      previousMetrics.totalExerciseSessions,
      currentMetrics.totalExerciseSessions
    ),
    averageDailyWater: calculatePercentageChange(
      previousMetrics.averageDailyWater,
      currentMetrics.averageDailyWater
    ),
    nutritionTrackingStreak: calculatePercentageChange(
      previousMetrics.nutritionTrackingStreak,
      currentMetrics.nutritionTrackingStreak
    ),
    goalCompletionPercentage: calculatePercentageChange(
      previousMetrics.goalCompletionPercentage,
      currentMetrics.goalCompletionPercentage
    )
  };
  
  return {
    currentPeriod: currentMetrics,
    previousPeriod: previousMetrics,
    percentageChanges
  };
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

export async function getHealthData(dateRange: DateRange): Promise<HealthDataPoint[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return generateMockHealthData(dateRange);
}