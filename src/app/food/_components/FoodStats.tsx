'use client';

import { DailyNutritionStats } from '@/lib/types/food';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface FoodStatsProps {
  stats: DailyNutritionStats;
  isLoading?: boolean;
}

export default function FoodStats({ stats, isLoading }: FoodStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Calories',
      value: stats.totalCalories,
      unit: 'cal',
      icon: <Flame className="w-6 h-6" />,
      color: 'from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-600'
    },
    {
      title: 'Protein',
      value: stats.totalProtein.toFixed(1),
      unit: 'g',
      icon: <Beef className="w-6 h-6" />,
      color: 'from-red-50 to-pink-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Carbohydrates',
      value: stats.totalCarbs.toFixed(1),
      unit: 'g',
      icon: <Wheat className="w-6 h-6" />,
      color: 'from-yellow-50 to-amber-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Fats',
      value: stats.totalFats.toFixed(1),
      unit: 'g',
      icon: <Droplet className="w-6 h-6" />,
      color: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 bg-gradient-to-br ${card.color} rounded-lg ${card.iconColor} w-fit mb-4`}>
              {card.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {card.unit}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Meal Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.entriesByMealType).map(([mealType, entries]) => {
            const mealCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
            const mealPercentage = stats.totalCalories > 0 
              ? ((mealCalories / stats.totalCalories) * 100).toFixed(0)
              : 0;

            const getMealColor = () => {
              switch (mealType) {
                case 'BREAKFAST': return 'bg-yellow-100 text-yellow-800';
                case 'LUNCH': return 'bg-blue-100 text-blue-800';
                case 'DINNER': return 'bg-purple-100 text-purple-800';
                case 'SNACK': return 'bg-pink-100 text-pink-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };

            return (
              <div key={mealType} className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getMealColor()}`}>
                  {mealType}
                </div>
                <div className="text-2xl font-bold text-gray-900">{mealCalories}</div>
                <div className="text-sm text-gray-600">
                  cal ({mealPercentage}%)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Distribution */}
      {(stats.totalProtein > 0 || stats.totalCarbs > 0 || stats.totalFats > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrient Distribution</h3>
          <div className="space-y-3">
            {[
              { name: 'Protein', value: stats.totalProtein, color: 'bg-red-500', calories: stats.totalProtein * 4 },
              { name: 'Carbs', value: stats.totalCarbs, color: 'bg-yellow-500', calories: stats.totalCarbs * 4 },
              { name: 'Fats', value: stats.totalFats, color: 'bg-blue-500', calories: stats.totalFats * 9 }
            ].map((macro) => {
              const totalMacroCalories = (stats.totalProtein * 4) + (stats.totalCarbs * 4) + (stats.totalFats * 9);
              const percentage = totalMacroCalories > 0 
                ? ((macro.calories / totalMacroCalories) * 100).toFixed(0)
                : 0;

              return (
                <div key={macro.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{macro.name}</span>
                    <span className="text-gray-600">
                      {macro.value.toFixed(1)}g ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${macro.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
