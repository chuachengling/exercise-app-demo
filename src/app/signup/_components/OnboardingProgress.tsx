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
      {/* Step indicator text */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Step {currentStep} of {totalSteps}
        </div>
        {stepTitle && (
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {stepTitle}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={`Step ${currentStep} of ${totalSteps}`}
          />
        </div>
        
        {/* Percentage label */}
        <div className="absolute -top-1 text-xs font-medium text-blue-600 dark:text-blue-400 transition-all duration-500"
             style={{ left: `${Math.max(0, Math.min(95, progressPercentage - 5))}%` }}>
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`
                  w-4 h-4 rounded-full transition-all duration-300 relative
                  ${isCompleted 
                    ? 'bg-blue-600 shadow-md' 
                    : isCurrent 
                      ? 'bg-blue-600 ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg scale-110' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
                aria-label={`Step ${stepNumber}${isCompleted ? ' completed' : isCurrent ? ' current' : ''}`}
              >
                {isCompleted && (
                  <svg className="w-3 h-3 text-white absolute inset-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Step number below dot */}
              <span className={`text-xs mt-1 font-medium ${
                isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {stepNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}