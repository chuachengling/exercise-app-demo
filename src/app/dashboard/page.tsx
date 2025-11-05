'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimeRange, DashboardState, HealthDataPoint, SummaryMetrics, ChartDataPoint, DateRange } from '@/lib/types/dashboard';
import { getDateRangeForPeriod, transformToChartData } from '@/lib/data/health-metrics';
import { useRequireAuth } from '@/lib/contexts/AuthContext';
import exerciseService from '@/lib/services/exerciseService';
import foodService from '@/lib/services/foodService';
import { Exercise } from '@/lib/types/exercise';
import { FoodEntry } from '@/lib/types/food';
import TimeRangeSelector from './_components/TimeRangeSelector';
import SummaryCards from './_components/SummaryCards';
import HealthChart from './_components/HealthChart';
import MetricsGrid from './_components/MetricsGrid';
import { RefreshCw, Calendar } from 'lucide-react';

const DEFAULT_TIME_RANGE: TimeRange = { 
  label: 'Week', 
  value: 'week', 
  days: 7 
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, shouldRedirect, redirectTo } = useRequireAuth();
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isLoading: true,
    selectedTimeRange: DEFAULT_TIME_RANGE,
    chartType: 'overview',
    healthData: [],
    summaryMetrics: null,
    chartData: [],
    dateRange: getDateRangeForPeriod('week'),
    refreshTimestamp: new Date()
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (shouldRedirect) {
      router.push(`${redirectTo}?redirect=/dashboard`);
    }
  }, [shouldRedirect, redirectTo, router]);

  // Show loading if auth is loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Transform exercise and food data to health data format
  const transformToHealthData = (exercises: Exercise[], foodEntries: FoodEntry[], dateRange: DateRange): HealthDataPoint[] => {
    const { startDate, endDate } = dateRange;
    const daysMap = new Map<string, HealthDataPoint>();
    
    // Initialize all days with empty data
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      daysMap.set(dateKey, {
        date: new Date(currentDate),
        exerciseMinutes: 0,
        caloriesConsumed: 0,
        waterIntake: 2.0, // Default water intake
        weight: undefined
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Aggregate exercise data by date
    exercises.forEach(exercise => {
      const exerciseDate = new Date(exercise.date);
      const dateKey = exerciseDate.toISOString().split('T')[0];
      const dayData = daysMap.get(dateKey);
      
      if (dayData) {
        dayData.exerciseMinutes += exercise.duration || 0;
      }
    });
    
    // Aggregate food data by date
    foodEntries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const dateKey = entryDate.toISOString().split('T')[0];
      const dayData = daysMap.get(dateKey);
      
      if (dayData) {
        dayData.caloriesConsumed += entry.calories || 0;
      }
    });
    
    return Array.from(daysMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Calculate metrics from exercise and food data
  const calculateMetrics = (exercises: Exercise[], foodEntries: FoodEntry[], dateRange: DateRange): SummaryMetrics => {
    const healthData = transformToHealthData(exercises, foodEntries, dateRange);
    
    // Calculate nutrition streak (consecutive days with food entries)
    const uniqueFoodDays = new Set(foodEntries.map(entry => 
      new Date(entry.timestamp).toISOString().split('T')[0]
    ));
    
    const currentMetrics = {
      totalExerciseSessions: exercises.length,
      averageDailyWater: Number((healthData.reduce((sum: number, d: HealthDataPoint) => sum + d.waterIntake, 0) / healthData.length).toFixed(2)),
      nutritionTrackingStreak: uniqueFoodDays.size,
      goalCompletionPercentage: Number(Math.min(100, (exercises.length / 7) * 100).toFixed(2)) // Based on exercise frequency
    };
    
    // For now, use same data for previous period (could be enhanced to compare actual previous period)
    const previousMetrics = { ...currentMetrics };
    
    const percentageChanges = {
      totalExerciseSessions: 0,
      averageDailyWater: 0,
      nutritionTrackingStreak: 0,
      goalCompletionPercentage: 0
    };
    
    return {
      currentPeriod: currentMetrics,
      previousPeriod: previousMetrics,
      percentageChanges
    };
  };

  // Load dashboard data
  const loadDashboardData = async (timeRange: TimeRange) => {
    if (!user?.id) {
      console.log('Dashboard: No user ID available, skipping data load');
      return;
    }
    
    setDashboardState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const dateRange = getDateRangeForPeriod(timeRange.value);
      
      // Load exercise and food data in parallel
      const [exercises, foodEntries] = await Promise.all([
        exerciseService.getExercises(user.id),
        foodService.getFoodEntries(user.id)
      ]);
      console.log('Dashboard: Loaded exercises for user', user.id, ':', exercises.length, exercises);
      console.log('Dashboard: Loaded food entries for user', user.id, ':', foodEntries.length, foodEntries);
      
      // Filter exercises to date range
      const filteredExercises = exercises.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= dateRange.startDate && exerciseDate <= dateRange.endDate;
      });
      
      // Filter food entries to date range
      const filteredFoodEntries = foodEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.startDate && entryDate <= dateRange.endDate;
      });
      
      console.log('Dashboard: Filtered exercises for date range:', filteredExercises.length, filteredExercises);
      console.log('Dashboard: Filtered food entries for date range:', filteredFoodEntries.length, filteredFoodEntries);
      
      // Transform data for dashboard
      const healthData = transformToHealthData(filteredExercises, filteredFoodEntries, dateRange);
      const summaryMetrics = calculateMetrics(filteredExercises, filteredFoodEntries, dateRange);
      const chartData = transformToChartData(healthData);
      
      setDashboardState(prev => ({
        ...prev,
        isLoading: false,
        selectedTimeRange: timeRange,
        healthData,
        summaryMetrics,
        chartData,
        dateRange,
        refreshTimestamp: new Date()
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle time range changes
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    loadDashboardData(timeRange);
  };

  // Handle chart type changes
  const handleChartTypeChange = (chartType: 'overview' | 'exercise' | 'nutrition' | 'hydration') => {
    setDashboardState(prev => ({ ...prev, chartType }));
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData(dashboardState.selectedTimeRange);
  };

  // Load initial data when user is available
  useEffect(() => {
    if (user?.id) {
      console.log('Dashboard: Loading initial data with user:', user.id);
      loadDashboardData(DEFAULT_TIME_RANGE);
    }
  }, [user?.id]);

  // Format date range for display
  const formatDateRange = () => {
    const { startDate, endDate } = dashboardState.dateRange;
    const start = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{formatDateRange()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <TimeRangeSelector
                selectedRange={dashboardState.selectedTimeRange}
                onRangeChange={handleTimeRangeChange}
              />
              <button
                onClick={handleRefresh}
                disabled={dashboardState.isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
                  bg-blue-600 text-white hover:bg-blue-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 hover:scale-105
                  ${dashboardState.isLoading ? 'animate-pulse' : ''}
                `}
              >
                <RefreshCw className={`w-4 h-4 ${dashboardState.isLoading ? 'animate-spin' : ''}`} />
                <span>{dashboardState.isLoading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Summary Cards */}
          <section>
            <SummaryCards 
              metrics={dashboardState.summaryMetrics}
              isLoading={dashboardState.isLoading}
            />
          </section>

          {/* Health Chart */}
          <section>
            <HealthChart
              data={dashboardState.chartData}
              chartType={dashboardState.chartType}
              onChartTypeChange={handleChartTypeChange}
              isLoading={dashboardState.isLoading}
            />
          </section>

          {/* Detailed Metrics Grid */}
          <section>
            <MetricsGrid
              data={dashboardState.healthData}
              isLoading={dashboardState.isLoading}
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Last updated: {dashboardState.refreshTimestamp.toLocaleTimeString()}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{dashboardState.healthData.length} data points</span>
              <span>•</span>
              <span>{dashboardState.selectedTimeRange.label.toLowerCase()} view</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}