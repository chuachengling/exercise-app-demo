'use client';

import { useState } from 'react';
import { TimeRange } from '@/lib/types/dashboard';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Week', value: 'week', days: 7 },
  { label: 'Month', value: 'month', days: 30 },
  { label: 'Quarter', value: 'quarter', days: 90 },
  { label: 'Year', value: 'year', days: 365 }
];

export function TimeRangeSelector({ 
  selectedRange, 
  onRangeChange, 
  className = '' 
}: TimeRangeSelectorProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRangeChange = async (range: TimeRange) => {
    if (range.value === selectedRange.value) return;
    
    setIsAnimating(true);
    
    // Small delay for smooth transition
    setTimeout(() => {
      onRangeChange(range);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="relative bg-gray-100 rounded-lg p-1 flex">
        {/* Background slider */}
        <div 
          className={`absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-out ${
            isAnimating ? 'opacity-90' : 'opacity-100'
          }`}
          style={{
            left: `${TIME_RANGES.findIndex(r => r.value === selectedRange.value) * 25}%`,
            width: '25%'
          }}
        />
        
        {/* Range buttons */}
        {TIME_RANGES.map((range) => {
          const isSelected = range.value === selectedRange.value;
          
          return (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range)}
              className={`
                relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                flex-1 text-center min-w-0
                ${isSelected 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${isAnimating ? 'scale-95' : 'scale-100'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={isAnimating}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TimeRangeSelector;