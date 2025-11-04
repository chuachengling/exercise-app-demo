'use client';

import { ArrowLeft } from 'lucide-react';
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
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <OnboardingProgress 
            currentStep={2} 
            totalSteps={3} 
            stepTitle="Health Goals"
          />
        </div>

        {/* Main content */}
        <div className="text-center mb-8">
          <h1 className="font-inter text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What's your health goal?
          </h1>
          <p className="font-inter text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Choose your primary focus so we can personalize your experience and provide relevant recommendations.
          </p>
        </div>

        {/* Goal selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {HEALTH_GOALS.map((goal) => (
            <HealthGoalCard
              key={goal.id}
              goal={goal}
              isSelected={selectedGoal === goal.id}
              onSelect={handleGoalSelection}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* Error messages */}
        {errors.goal && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {errors.goal}
            </p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={submitGoalSelection}
            disabled={!isValid || isSubmitting}
            className={`
              px-8 py-3 rounded-lg font-inter text-base font-medium transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label={isSubmitting ? 'Saving your selection...' : 'Continue to next step'}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't worry, you can change your goal anytime in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}