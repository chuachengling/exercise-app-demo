export type HealthGoalId = 'weight_loss' | 'muscle_gain' | 'competition_prep' | 'general_health';

export interface HealthGoal {
  id: HealthGoalId;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  aiPromptContext: string;
}

export interface UserGoalPreference {
  userId: string;
  goalId: HealthGoalId;
  selectedAt: Date;
  isActive: boolean;
}

export interface SignupFormState {
  // User Data
  email: string;
  password: string;
  selectedGoal: HealthGoalId | null;
  
  // UI States
  isSubmitting: boolean;
  currentStep: number;
  errors: Record<string, string>;
  
  // Form States
  isValid: boolean;
  isDirty: boolean;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  userData: Partial<User>;
  isComplete: boolean;
}

export interface SignupFormStore {
  state: OnboardingState;
  selectedGoal: HealthGoalId | null;
  setSelectedGoal: (goalId: HealthGoalId) => void;
  saveGoalPreference: () => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}