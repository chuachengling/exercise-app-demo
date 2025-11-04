'use client';

import { HealthGoal, HealthGoalId } from '@/lib/types/healthGoals';
import { getHealthGoalIcon } from '@/constants/healthGoals';

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
        group relative p-6 bg-white dark:bg-gray-800 rounded-2xl cursor-pointer
        transition-all duration-200 ease-in-out min-h-[200px] shadow-sm
        hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        border-2 ${isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
        ${className}
      `}
      aria-describedby={`${goal.id}-description`}
    >
      {/* Selection indicator */}
      <div className={`absolute top-4 right-4 transition-all duration-200 ${
        isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}>
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center text-center h-full justify-between">
        {/* Icon */}
        <div className={`text-5xl mb-4 transition-transform duration-200 group-hover:scale-110 ${
          isSelected ? 'scale-110' : ''
        }`}>
          {getHealthGoalIcon(goal.icon)}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {goal.title}
          </h3>

          {/* Description */}
          <p 
            id={`${goal.id}-description`}
            className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3"
          >
            {goal.description}
          </p>

          {/* Benefits */}
          <div className="space-y-2">
            {goal.benefits.slice(0, 2).map((benefit, index) => (
              <div key={index} className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                <span className="text-center">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selection button */}
        <div className={`mt-4 w-full transition-all duration-200 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {isSelected ? 'Selected' : 'Select Goal'}
          </div>
        </div>
      </div>
    </div>
  );
}