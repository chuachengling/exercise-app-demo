'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimeRange, DashboardState, HealthDataPoint, SummaryMetrics, ChartDataPoint } from '@/lib/types/dashboard';
import { getDateRangeForPeriod, getHealthMetrics, getHealthData, transformToChartData } from '@/lib/data/health-metrics';
import { useRequireAuth } from '@/lib/contexts/AuthContext';
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

  // Load dashboard data
  const loadDashboardData = async (timeRange: TimeRange) => {
    setDashboardState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const dateRange = getDateRangeForPeriod(timeRange.value);
      
      // Load data in parallel
      const [healthData, summaryMetrics] = await Promise.all([
        getHealthData(dateRange),
        getHealthMetrics(dateRange)
      ]);
      
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

  // Load initial data
  useEffect(() => {
    loadDashboardData(DEFAULT_TIME_RANGE);
  }, []);

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