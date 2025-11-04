'use client';

import { HealthGoal, HealthGoalId } from '@/lib/types/healthGoals';
import { getHealthGoalIcon } from '@/constants/healthGoals';
import { Check } from 'lucide-react';

interface HealthGoalCardProps {
  goal: HealthGoal;
  isSelected: boolean;
  onSelect: (goalId: HealthGoalId) => void;
  className?: string;
}

export default function HealthGoalCard({ 
  goal, 
  isSelected, 
  onSelect, 
  className = '' 
}: HealthGoalCardProps) {
  const handleClick = () => {
    onSelect(goal.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(goal.id);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative p-6 bg-white dark:bg-gray-800 border rounded-xl cursor-pointer
        transition-all duration-150 ease-in-out min-h-[160px] lg:min-h-[160px] md:min-h-[140px] sm:min-h-[120px]
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${className}
      `}
      aria-describedby={`${goal.id}-description`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Goal icon */}
      <div className="flex items-center space-y-3 flex-col">
        <div className="text-4xl mb-2" aria-hidden="true">
          {getHealthGoalIcon(goal.icon)}
        </div>

        {/* Goal title */}
        <h3 className="font-inter text-lg lg:text-lg md:text-base font-semibold text-gray-900 dark:text-white text-center">
          {goal.title}
        </h3>

        {/* Goal description */}
        <p 
          id={`${goal.id}-description`}
          className="font-inter text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed"
        >
          {goal.description}
        </p>

        {/* Benefits */}
        <div className="mt-3">
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {goal.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="flex items-center text-center justify-center">
                <span className="w-1 h-1 bg-blue-500 rounded-full mr-2" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}