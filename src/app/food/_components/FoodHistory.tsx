'use client';

import { FoodEntry } from '@/lib/types/food';
import FoodEntryCard from './FoodEntryCard';
import { Calendar } from 'lucide-react';

interface FoodHistoryProps {
  entries: FoodEntry[];
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entryId: string) => void;
}

export default function FoodHistory({ entries, onEdit, onDelete }: FoodHistoryProps) {
  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, FoodEntry[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const calculateDailyTotals = (dayEntries: FoodEntry[]) => {
    return dayEntries.reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories,
        protein: totals.protein + (entry.macros?.protein || 0),
        carbs: totals.carbs + (entry.macros?.carbs || 0),
        fats: totals.fats + (entry.macros?.fats || 0),
        count: totals.count + 1
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 }
    );
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No food entries</h3>
        <p className="text-gray-600">Your food history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([date, dayEntries]) => {
        const totals = calculateDailyTotals(dayEntries);

        return (
          <div key={date} className="space-y-4">
            {/* Date Header with Daily Totals */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(date)}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {totals.count} {totals.count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-1 font-bold text-green-600">
                      {totals.calories} cal
                    </span>
                  </div>
                  {totals.protein > 0 && (
                    <>
                      <div>
                        <span className="text-gray-600">P:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {totals.protein.toFixed(1)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">C:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {totals.carbs.toFixed(1)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">F:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {totals.fats.toFixed(1)}g
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Food Entries for this date */}
            <div className="space-y-3">
              {dayEntries.map((entry) => (
                <FoodEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
