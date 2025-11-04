'use client';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  className?: string;
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  stepTitle = '',
  className = '' 
}: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Step {currentStep} of {totalSteps}
        </div>
        {stepTitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stepTitle}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${currentStep} of ${totalSteps}`}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-center space-x-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${isCompleted 
                  ? 'bg-blue-600' 
                  : isCurrent 
                    ? 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              aria-label={`Step ${stepNumber}${isCompleted ? ' completed' : isCurrent ? ' current' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}