'use client';

import { Droplet, Trophy, Target } from 'lucide-react';
import { DailyWaterStats } from '@/lib/types/water';
import { formatWaterAmount } from '@/lib/services/waterService';
import { WaterUnit } from '@/lib/types/water';

interface WaterProgressCardProps {
  stats: DailyWaterStats | null;
  isLoading?: boolean;
  preferredUnit?: WaterUnit;
}

export default function WaterProgressCard({ 
  stats, 
  isLoading = false,
  preferredUnit = WaterUnit.ML 
}: WaterProgressCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-8">
          <Droplet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const percentage = Math.min(stats.percentage, 100);
  const isGoalMet = stats.percentage >= 100;
  const remaining = Math.max(0, stats.goalAmount - stats.totalAmount);

  // Determine progress color
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressGradient = () => {
    if (percentage >= 100) return 'from-green-400 to-green-600';
    if (percentage >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-500" />
          Today's Progress
        </h2>
        {isGoalMet && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <Trophy className="w-4 h-4" />
            Goal Met!
          </div>
        )}
      </div>

      {/* Current / Goal Display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-1">
          {formatWaterAmount(stats.totalAmount, preferredUnit)}
        </div>
        <div className="text-sm text-gray-600">
          of {formatWaterAmount(stats.goalAmount, preferredUnit)} goal
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{percentage}% Complete</span>
          <span>{stats.entryCount} {stats.entryCount === 1 ? 'entry' : 'entries'}</span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressGradient()} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {percentage > 10 && (
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span className="text-xs font-medium text-white">
                  {percentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remaining Amount */}
      {!isGoalMet && remaining > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-blue-900">
              {formatWaterAmount(remaining, preferredUnit)} remaining
            </div>
            <div className="text-xs text-blue-700">
              Keep going! You're doing great!
            </div>
          </div>
        </div>
      )}

      {/* Goal Exceeded */}
      {isGoalMet && stats.percentage > 100 && (
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-green-900">
              Exceeded goal by {formatWaterAmount(stats.totalAmount - stats.goalAmount, preferredUnit)}!
            </div>
            <div className="text-xs text-green-700">
              Excellent hydration today!
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {stats.entryCount}
          </div>
          <div className="text-xs text-gray-600">Times Logged</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {stats.entryCount > 0 
              ? formatWaterAmount(stats.totalAmount / stats.entryCount, preferredUnit)
              : '0 ml'
            }
          </div>
          <div className="text-xs text-gray-600">Avg per Entry</div>
        </div>
      </div>
    </div>
  );
}
