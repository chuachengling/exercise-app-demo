'use client';

import { FoodEntry, MealType } from '@/lib/types/food';
import { Edit2, Trash2, Clock } from 'lucide-react';

interface FoodEntryCardProps {
  entry: FoodEntry;
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entryId: string) => void;
}

export default function FoodEntryCard({ entry, onEdit, onDelete }: FoodEntryCardProps) {
  const getMealTypeBadgeColor = (mealType: MealType) => {
    switch (mealType) {
      case MealType.BREAKFAST:
        return 'bg-yellow-100 text-yellow-800';
      case MealType.LUNCH:
        return 'bg-blue-100 text-blue-800';
      case MealType.DINNER:
        return 'bg-purple-100 text-purple-800';
      case MealType.SNACK:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">{entry.name}</h4>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getMealTypeBadgeColor(entry.mealType)}`}>
                  {entry.mealType}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(entry.timestamp)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Portion:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {entry.portionSize} {entry.portionUnit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Calories:</span>
                  <span className="ml-1 font-semibold text-green-600">
                    {entry.calories} cal
                  </span>
                </div>
              </div>

              {entry.macros && (
                <div className="mt-2 flex gap-4 text-xs text-gray-600">
                  <span>Protein: <span className="font-medium text-gray-900">{entry.macros.protein}g</span></span>
                  <span>Carbs: <span className="font-medium text-gray-900">{entry.macros.carbs}g</span></span>
                  <span>Fats: <span className="font-medium text-gray-900">{entry.macros.fats}g</span></span>
                </div>
              )}

              {entry.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this food entry?')) {
                onDelete(entry.id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
