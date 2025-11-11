'use client';

import { useState } from 'react';
import { Calendar, Droplet } from 'lucide-react';
import { WaterEntry, WaterUnit } from '@/lib/types/water';
import WaterEntryCard from './WaterEntryCard';
import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { formatWaterAmount } from '@/lib/services/waterService';

interface WaterHistoryProps {
  entries: WaterEntry[];
  onDeleteEntry: (id: string) => Promise<void>;
  preferredUnit?: WaterUnit;
  isLoading?: boolean;
}

interface GroupedEntries {
  date: Date;
  entries: WaterEntry[];
  totalAmount: number;
}

export default function WaterHistory({ 
  entries, 
  onDeleteEntry,
  preferredUnit = WaterUnit.ML,
  isLoading = false
}: WaterHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group entries by date
  const groupedEntries: GroupedEntries[] = entries.reduce((groups: GroupedEntries[], entry) => {
    const entryDate = startOfDay(new Date(entry.timestamp));
    const existingGroup = groups.find(g => isSameDay(g.date, entryDate));

    if (existingGroup) {
      existingGroup.entries.push(entry);
      existingGroup.totalAmount += entry.amount;
    } else {
      groups.push({
        date: entryDate,
        entries: [entry],
        totalAmount: entry.amount
      });
    }

    return groups;
  }, []);

  // Sort groups by date (most recent first)
  groupedEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Filter by selected date if applicable
  const filteredGroups = selectedDate
    ? groupedEntries.filter(g => isSameDay(g.date, selectedDate))
    : groupedEntries;

  // Quick date filters
  const quickFilters = [
    { label: 'All Time', value: null },
    { label: 'Today', value: startOfDay(new Date()) },
    { label: 'Yesterday', value: startOfDay(subDays(new Date(), 1)) },
    { label: 'Last 7 Days', value: startOfDay(subDays(new Date(), 7)) },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Water Entries Yet</h3>
        <p className="text-gray-600">
          Start tracking your water intake to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Date</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(filter => (
            <button
              key={filter.label}
              onClick={() => setSelectedDate(filter.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedDate === filter.value || (filter.value === null && selectedDate === null)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Entries */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No entries found for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(group => (
            <div key={group.date.toISOString()} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(group.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatWaterAmount(group.totalAmount, preferredUnit)}
                  </div>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {group.entries
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(entry => (
                    <WaterEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={onDeleteEntry}
                      preferredUnit={preferredUnit}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
