import { HealthGoal } from '@/lib/types/healthGoals';

export const HEALTH_GOALS: HealthGoal[] = [
  {
    id: 'weight_loss',
    title: 'Lose Weight',
    description: 'Focus on sustainable weight loss through balanced nutrition and exercise tracking.',
    icon: 'scale',
    benefits: ['Calorie tracking', 'Weight progress monitoring', 'Healthy recipe suggestions'],
    aiPromptContext: 'weight loss, calorie deficit, healthy nutrition, sustainable habits'
  },
  {
    id: 'muscle_gain',
    title: 'Build Muscle',
    description: 'Optimize your strength training and nutrition for muscle growth and performance.',
    icon: 'dumbbell',
    benefits: ['Strength tracking', 'Protein intake monitoring', 'Muscle-building workouts'],
    aiPromptContext: 'muscle building, strength training, high protein, progressive overload'
  },
  {
    id: 'competition_prep',
    title: 'Competition Training',
    description: 'Structured training programs and precise tracking for athletic competition preparation.',
    icon: 'trophy',
    benefits: ['Performance analytics', 'Training periodization', 'Competition-focused nutrition'],
    aiPromptContext: 'competition preparation, athletic performance, periodization, peak performance'
  },
  {
    id: 'general_health',
    title: 'General Health',
    description: 'Maintain overall wellness with balanced tracking of exercise, nutrition, and hydration.',
    icon: 'heart',
    benefits: ['Holistic health tracking', 'Wellness insights', 'Balanced lifestyle recommendations'],
    aiPromptContext: 'general wellness, balanced lifestyle, health maintenance, holistic approach'
  }
];

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Account Setup', path: '/signup' },
  { id: 2, title: 'Health Goals', path: '/signup/goals' },
  { id: 3, title: 'Profile Setup', path: '/signup/profile-setup' }
];

export const getHealthGoalById = (id: string): HealthGoal | undefined => {
  return HEALTH_GOALS.find(goal => goal.id === id);
};

export const getHealthGoalIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    scale: '⚖️',
    dumbbell: '🏋️',
    trophy: '🏆',
    heart: '❤️'
  };
  return iconMap[iconName] || '🎯';
};