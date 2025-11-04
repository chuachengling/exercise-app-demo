'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HealthGoalId } from '@/lib/types/healthGoals';
import { saveUserGoalPreference } from '@/lib/database/userGoals';

interface UseHealthGoalFormReturn {
  selectedGoal: HealthGoalId | null;
  isSubmitting: boolean;
  errors: Record<string, string>;
  isValid: boolean;
  handleGoalSelection: (goalId: HealthGoalId) => void;
  submitGoalSelection: () => Promise<void>;
  goBack: () => void;
  clearErrors: () => void;
}

export default function useHealthGoalForm(): UseHealthGoalFormReturn {
  const [selectedGoal, setSelectedGoal] = useState<HealthGoalId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateSelection = useCallback(() => {
    if (!selectedGoal) {
      setErrors({ goal: 'Please select a health goal to continue' });
      return false;
    }
    setErrors({});
    return true;
  }, [selectedGoal]);

  const handleGoalSelection = useCallback((goalId: HealthGoalId) => {
    setSelectedGoal(goalId);
    // Clear any existing errors when user makes selection
    if (errors.goal) {
      setErrors(prev => ({ ...prev, goal: '' }));
    }
  }, [errors.goal]);

  const submitGoalSelection = useCallback(async () => {
    if (!validateSelection()) return;

    setIsSubmitting(true);
    try {
      // For demo purposes, we'll use a mock user ID
      // In a real app, this would come from authentication context
      const mockUserId = 'demo-user-' + Date.now();
      
      // Save to local database
      await saveUserGoalPreference(mockUserId, {
        goalId: selectedGoal!,
        selectedAt: new Date(),
        isActive: true
      });

      // Navigate to next step
      router.push('/signup/profile-setup');
    } catch (error) {
      console.error('Error saving goal selection:', error);
      setErrors({ 
        submit: 'Failed to save your goal selection. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedGoal, validateSelection, router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    selectedGoal,
    isSubmitting,
    errors,
    isValid: selectedGoal !== null,
    handleGoalSelection,
    submitGoalSelection,
    goBack,
    clearErrors,
  };
}