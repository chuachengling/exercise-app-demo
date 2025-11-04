export enum ExerciseType {
  HIIT = 'hiit',
  WEIGHTLIFTING = 'weightlifting',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  SPORTS = 'sports',
  ARMS = 'arms'
}

export enum IntensityLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export interface ExerciseSet {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

export interface ExerciseTypeData {
  // HIIT specific
  rounds?: number;
  workInterval?: number;
  restInterval?: number;
  
  // Strength training specific
  exercises?: ExerciseSet[];
  totalWeight?: number;
  
  // Cardio specific
  distance?: number;
  pace?: number;
  heartRate?: number[];
  
  // Sports specific
  sport?: string;
  score?: string;
  opponent?: string;
}

export interface Exercise {
  id: string;
  userId: string;
  type: ExerciseType;
  name: string;
  duration: number; // in minutes
  intensity: IntensityLevel;
  date: Date;
  notes?: string;
  caloriesBurned?: number;
  createdAt: Date;
  updatedAt: Date;
  typeSpecificData: ExerciseTypeData;
}

export interface ExerciseFormData {
  type: ExerciseType;
  name: string;
  duration: number;
  intensity: IntensityLevel;
  date: string;
  notes: string;
  caloriesBurned: number;
  typeSpecificData: Partial<ExerciseTypeData>;
}

export interface ExerciseFilters {
  type?: ExerciseType;
  dateRange?: { start: Date; end: Date };
  intensity?: IntensityLevel;
  searchQuery?: string;
}

export interface ExerciseStats {
  totalExercises: number;
  totalDuration: number;
  averageIntensity: number;
  favoriteType: ExerciseType;
  currentStreak: number;
  longestStreak: number;
  weeklyGoalProgress: number;
  exercisesThisWeek: number;
  exercisesThisMonth: number;
  exercisesByType: Record<ExerciseType, number>;
  intensityDistribution: Record<IntensityLevel, number>;
  weeklyData: Array<{
    date: string;
    exercises: number;
    duration: number;
  }>;
}

export interface ExerciseFormState {
  // UI States
  isLoading: boolean;
  isTimerActive: boolean;
  currentType: ExerciseType | null;
  showQuickEntry: boolean;
  
  // Form States
  formData: ExerciseFormData;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  
  // Data States
  exercises: Exercise[];
  filteredExercises: Exercise[];
  searchQuery: string;
  selectedDate: Date;
  
  // Timer States
  startTime: Date | null;
  elapsedTime: number;
  isRecording: boolean;
}