'use client';

import { HEALTH_GOALS } from '@/constants/healthGoals';
import HealthGoalCard from './HealthGoalCard';
import OnboardingProgress from './OnboardingProgress';
import useHealthGoalForm from './useHealthGoalForm';

interface HealthGoalSelectionProps {
  className?: string;
}

export default function HealthGoalSelection({ className = '' }: HealthGoalSelectionProps) {
  const {
    selectedGoal,
    isSubmitting,
    errors,
    isValid,
    handleGoalSelection,
    submitGoalSelection,
    goBack,
  } = useHealthGoalForm();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 group"
            aria-label="Go back to previous step"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={3} 
            stepTitle="Health Goals"
            className="flex-1 max-w-xs"
          />
        </div>

        {/* Main content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            What's your health goal?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Choose your primary focus so we can personalize your experience and provide 
            <span className="text-blue-600 dark:text-blue-400 font-medium"> relevant recommendations</span> just for you.
          </p>
        </div>

        {/* Goal selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {HEALTH_GOALS.map((goal, index) => (
            <div
              key={goal.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <HealthGoalCard
                goal={goal}
                isSelected={selectedGoal === goal.id}
                onSelect={handleGoalSelection}
              />
            </div>
          ))}
        </div>

        {/* Error messages */}
        {errors.goal && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.goal}
              </p>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.submit}
              </p>
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={submitGoalSelection}
            disabled={!isValid || isSubmitting}
            className={`
              group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label={isSubmitting ? 'Saving your selection...' : 'Continue to next step'}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Saving your goal...
              </div>
            ) : (
              <div className="flex items-center">
                Continue
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Additional info */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            💡 Don't worry, you can change your goal anytime in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}