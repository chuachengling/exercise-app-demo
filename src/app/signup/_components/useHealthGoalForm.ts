'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HealthGoalId } from '@/lib/types/healthGoals';

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
      
      console.log('🚀 Submitting goal selection:', { 
        userId: mockUserId, 
        goalId: selectedGoal,
        selectedAt: new Date().toISOString()
      });
      
      // Save via API route
      const response = await fetch('/api/user/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mockUserId,
          goalId: selectedGoal!,
          selectedAt: new Date().toISOString(),
          isActive: true
        }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save goal preference');
      }

      const successData = await response.json();
      console.log('✅ Goal saved successfully:', successData);

      // Navigate to next step
      router.push('/signup/profile-setup');
    } catch (error) {
      console.error('❌ Error saving goal selection:', error);
      setErrors({ 
        submit: `Failed to save your goal selection: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` 
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