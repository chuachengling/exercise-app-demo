'use client';

import { TrendingUp, Droplet, Trophy, Target } from 'lucide-react';
import { DailyWaterStats, WaterUnit } from '@/lib/types/water';
import { formatWaterAmount } from '@/lib/services/waterService';
import { format } from 'date-fns';

interface WaterStatsProps {
  weeklyStats: DailyWaterStats[];
  preferredUnit?: WaterUnit;
  isLoading?: boolean;
}

export default function WaterStats({ 
  weeklyStats, 
  preferredUnit = WaterUnit.ML,
  isLoading = false 
}: WaterStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (weeklyStats.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h3>
        <p className="text-gray-600">
          Start tracking your water intake to see your statistics.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalAmount = weeklyStats.reduce((sum, day) => sum + day.totalAmount, 0);
  const daysWithData = weeklyStats.filter(day => day.entryCount > 0).length;
  const averageDaily = daysWithData > 0 ? totalAmount / daysWithData : 0;
  const goalsMetCount = weeklyStats.filter(day => day.percentage >= 100).length;
  const bestDay = weeklyStats.reduce((best, day) => 
    day.totalAmount > best.totalAmount ? day : best
  , weeklyStats[0]);
  const currentStreak = calculateStreak(weeklyStats);
  
  // Find max for chart scaling
  const maxAmount = Math.max(...weeklyStats.map(day => Math.max(day.totalAmount, day.goalAmount)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Droplet className="w-5 h-5" />}
          label="Weekly Total"
          value={formatWaterAmount(totalAmount, preferredUnit)}
          color="blue"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Daily Average"
          value={formatWaterAmount(averageDaily, preferredUnit)}
          color="cyan"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Goals Met"
          value={`${goalsMetCount}/7 days`}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Current Streak"
          value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
          color="purple"
        />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Weekly Breakdown
        </h3>
        
        <div className="space-y-3">
          {weeklyStats.map((day, index) => {
            const percentage = (day.totalAmount / maxAmount) * 100;
            const goalPercentage = (day.goalAmount / maxAmount) * 100;
            const isGoalMet = day.percentage >= 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 w-20">
                    {format(day.date, 'EEE')}
                  </span>
                  <span className="text-gray-600 flex-1 text-right mr-4">
                    {formatWaterAmount(day.totalAmount, preferredUnit)}
                  </span>
                  {isGoalMet && (
                    <Trophy className="w-4 h-4 text-green-500" />
                  )}
                </div>
                
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Goal marker */}
                  <div
                    className="absolute inset-y-0 border-r-2 border-dashed border-gray-400"
                    style={{ left: `${Math.min(goalPercentage, 100)}%` }}
                  />
                  
                  {/* Progress bar */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-lg ${
                      isGoalMet
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : day.totalAmount > 0
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                        : 'bg-gray-200'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  >
                    {percentage > 15 && (
                      <div className="flex items-center justify-end h-full pr-2">
                        <span className="text-xs font-medium text-white">
                          {day.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
              <span>Actual Intake</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 border-t-2 border-dashed border-gray-400"></div>
              <span>Daily Goal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Day */}
      {bestDay.totalAmount > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            Best Day This Week
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                {format(bestDay.date, 'EEEE, MMM d')}
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatWaterAmount(bestDay.totalAmount, preferredUnit)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {bestDay.entryCount} {bestDay.entryCount === 1 ? 'entry' : 'entries'}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {bestDay.percentage}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for stat cards
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'blue' | 'cyan' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Calculate consecutive days meeting goal (from most recent)
function calculateStreak(stats: DailyWaterStats[]): number {
  let streak = 0;
  
  // Sort by date descending (most recent first)
  const sorted = [...stats].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  for (const day of sorted) {
    if (day.percentage >= 100) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
