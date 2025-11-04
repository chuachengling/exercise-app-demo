'use client';

import { HealthDataPoint } from '@/lib/types/dashboard';
import { Activity, Utensils, Droplets, Weight, Calendar, Target, TrendingUp, Award } from 'lucide-react';

interface MetricsGridProps {
  data: HealthDataPoint[];
  isLoading?: boolean;
  className?: string;
}

interface DetailedMetricProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

function DetailedMetric({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  isLoading = false 
}: DetailedMetricProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">{title}</h4>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function calculateMetrics(data: HealthDataPoint[]) {
  if (data.length === 0) {
    return {
      totalExerciseMinutes: 0,
      averageExercisePerSession: 0,
      totalCalories: 0,
      averageCaloriesPerDay: 0,
      totalWaterIntake: 0,
      averageWeightChange: 0,
      mostActiveDay: 'N/A',
      consistencyScore: 0
    };
  }

  // Calculate totals and averages
  const totalExerciseMinutes = data.reduce((sum, d) => sum + d.exerciseMinutes, 0);
  const activeDays = data.filter(d => d.exerciseMinutes > 0);
  const averageExercisePerSession = activeDays.length > 0 
    ? Math.round(totalExerciseMinutes / activeDays.length) 
    : 0;

  const totalCalories = data.reduce((sum, d) => sum + d.caloriesConsumed, 0);
  const averageCaloriesPerDay = Math.round(totalCalories / data.length);

  const totalWaterIntake = Number(data.reduce((sum, d) => sum + d.waterIntake, 0).toFixed(1));

  // Weight change calculation
  const weightsWithData = data.filter(d => d.weight !== undefined).map(d => d.weight!);
  const averageWeightChange = weightsWithData.length > 1 
    ? Number((weightsWithData[weightsWithData.length - 1] - weightsWithData[0]).toFixed(1))
    : 0;

  // Find most active day
  const maxExerciseDay = data.reduce((max, current) => 
    current.exerciseMinutes > max.exerciseMinutes ? current : max
  );
  const mostActiveDay = maxExerciseDay.exerciseMinutes > 0 
    ? maxExerciseDay.date.toLocaleDateString('en-US', { weekday: 'long' })
    : 'N/A';

  // Consistency score (percentage of days with any activity)
  const consistencyScore = Math.round((activeDays.length / data.length) * 100);

  return {
    totalExerciseMinutes,
    averageExercisePerSession,
    totalCalories,
    averageCaloriesPerDay,
    totalWaterIntake,
    averageWeightChange,
    mostActiveDay,
    consistencyScore
  };
}

export function MetricsGrid({ 
  data, 
  isLoading = false, 
  className = '' 
}: MetricsGridProps) {
  const metrics = calculateMetrics(data);

  const metricItems = [
    {
      title: 'Total Exercise',
      value: isLoading ? '---' : `${metrics.totalExerciseMinutes} min`,
      subtitle: 'Total minutes exercised',
      icon: <Activity className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      title: 'Avg Per Session',
      value: isLoading ? '---' : `${metrics.averageExercisePerSession} min`,
      subtitle: 'Average exercise session',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      title: 'Total Calories',
      value: isLoading ? '---' : `${metrics.totalCalories.toLocaleString()}`,
      subtitle: 'Calories consumed',
      icon: <Utensils className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-orange-500 to-red-600'
    },
    {
      title: 'Daily Average',
      value: isLoading ? '---' : `${metrics.averageCaloriesPerDay}`,
      subtitle: 'Average daily calories',
      icon: <Target className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    {
      title: 'Total Hydration',
      value: isLoading ? '---' : `${metrics.totalWaterIntake}L`,
      subtitle: 'Water consumed',
      icon: <Droplets className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-600'
    },
    {
      title: 'Weight Change',
      value: isLoading ? '---' : `${metrics.averageWeightChange >= 0 ? '+' : ''}${metrics.averageWeightChange}kg`,
      subtitle: 'Total weight change',
      icon: <Weight className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-teal-500 to-green-600'
    },
    {
      title: 'Most Active Day',
      value: isLoading ? '---' : metrics.mostActiveDay,
      subtitle: 'Day with most exercise',
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      title: 'Consistency',
      value: isLoading ? '---' : `${metrics.consistencyScore}%`,
      subtitle: 'Days with activity',
      icon: <Award className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-rose-500 to-pink-600'
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Metrics</h3>
        <p className="text-sm text-gray-600">
          Comprehensive breakdown of your health and fitness data
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricItems.map((metric, index) => (
          <DetailedMetric
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            color={metric.color}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

export default MetricsGrid;