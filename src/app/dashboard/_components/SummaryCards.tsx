'use client';

import { SummaryMetrics } from '@/lib/types/dashboard';
import { TrendingUp, TrendingDown, Activity, Droplets, Target, Calendar } from 'lucide-react';

interface SummaryCardsProps {
  metrics: SummaryMetrics | null;
  isLoading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  suffix?: string;
  isLoading?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  suffix = '', 
  isLoading = false 
}: MetricCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const formatChange = (change: number) => {
    if (change === 0) return '0%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getTrendIcon = () => {
    if (isNeutral) return null;
    return isPositive ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <div className={`
          flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
          ${isPositive 
            ? 'bg-green-50 text-green-700' 
            : isNeutral 
            ? 'bg-gray-50 text-gray-600'
            : 'bg-red-50 text-red-700'
          }
        `}>
          {getTrendIcon()}
          <span>{formatChange(change)}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? Number(value.toFixed(2)) : value}
          </span>
          {suffix && (
            <span className="text-sm text-gray-500 font-medium">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 font-medium">
          {title}
        </p>
      </div>
    </div>
  );
}

export function SummaryCards({ 
  metrics, 
  isLoading = false, 
  className = '' 
}: SummaryCardsProps) {
  const cardData = metrics ? [
    {
      title: 'Exercise Sessions',
      value: metrics.currentPeriod.totalExerciseSessions,
      change: metrics.percentageChanges.totalExerciseSessions,
      icon: <Activity className="w-5 h-5" />,
      suffix: 'sessions'
    },
    {
      title: 'Daily Water Intake',
      value: metrics.currentPeriod.averageDailyWater,
      change: metrics.percentageChanges.averageDailyWater,
      icon: <Droplets className="w-5 h-5" />,
      suffix: 'L/day'
    },
    {
      title: 'Tracking Streak',
      value: metrics.currentPeriod.nutritionTrackingStreak,
      change: metrics.percentageChanges.nutritionTrackingStreak,
      icon: <Calendar className="w-5 h-5" />,
      suffix: 'days'
    },
    {
      title: 'Goal Completion',
      value: metrics.currentPeriod.goalCompletionPercentage,
      change: metrics.percentageChanges.goalCompletionPercentage,
      icon: <Target className="w-5 h-5" />,
      suffix: '%'
    }
  ] : [];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {isLoading || !metrics ? (
        // Show loading skeletons
        Array.from({ length: 4 }).map((_, index) => (
          <MetricCard
            key={index}
            title=""
            value=""
            change={0}
            icon={<div className="w-5 h-5" />}
            isLoading={true}
          />
        ))
      ) : (
        // Show actual data
        cardData.map((card, index) => (
          <MetricCard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            suffix={card.suffix}
          />
        ))
      )}
    </div>
  );
}

export default SummaryCards;