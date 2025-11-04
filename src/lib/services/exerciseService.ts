import { Exercise, ExerciseFormData, ExerciseType, IntensityLevel, ExerciseFilters, ExerciseStats } from '@/lib/types/exercise';

// Storage keys
const EXERCISES_STORAGE_KEY = 'exercise_app_exercises';

// Utility functions for local storage
function getStoredExercises(): Exercise[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(EXERCISES_STORAGE_KEY);
    if (!stored) return [];
    
    const exercises = JSON.parse(stored);
    return exercises.map((exercise: any) => ({
      ...exercise,
      date: new Date(exercise.date),
      createdAt: new Date(exercise.createdAt),
      updatedAt: new Date(exercise.updatedAt)
    }));
  } catch {
    return [];
  }
}

function saveExercises(exercises: Exercise[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
}

// Generate mock exercises for demo
function generateMockExercises(userId: string): Exercise[] {
  const now = new Date();
  const mockExercises: Exercise[] = [
    {
      id: `ex_${Date.now()}_1`,
      userId,
      type: ExerciseType.HIIT,
      name: 'Morning HIIT Session',
      duration: 30,
      intensity: IntensityLevel.HIGH,
      date: new Date(now.getTime() - 86400000), // Yesterday
      notes: 'Great energy today, pushed through all rounds',
      caloriesBurned: 250,
      createdAt: new Date(now.getTime() - 86400000),
      updatedAt: new Date(now.getTime() - 86400000),
      typeSpecificData: {
        rounds: 5,
        workInterval: 45,
        restInterval: 15
      }
    },
    {
      id: `ex_${Date.now()}_2`,
      userId,
      type: ExerciseType.WEIGHTLIFTING,
      name: 'Upper Body Strength',
      duration: 45,
      intensity: IntensityLevel.MODERATE,
      date: new Date(now.getTime() - 172800000), // 2 days ago
      notes: 'Focused on form over weight',
      caloriesBurned: 180,
      createdAt: new Date(now.getTime() - 172800000),
      updatedAt: new Date(now.getTime() - 172800000),
      typeSpecificData: {
        exercises: [
          { exercise: 'Bench Press', sets: 3, reps: 10, weight: 70, restTime: 90 },
          { exercise: 'Pull-ups', sets: 3, reps: 8, weight: 0, restTime: 60 }
        ],
        totalWeight: 2100
      }
    },
    {
      id: `ex_${Date.now()}_3`,
      userId,
      type: ExerciseType.CARDIO,
      name: 'Evening Run',
      duration: 35,
      intensity: IntensityLevel.MODERATE,
      date: new Date(now.getTime() - 259200000), // 3 days ago
      notes: 'Beautiful weather for a run',
      caloriesBurned: 320,
      createdAt: new Date(now.getTime() - 259200000),
      updatedAt: new Date(now.getTime() - 259200000),
      typeSpecificData: {
        distance: 5.2,
        pace: 6.7, // min/km
        heartRate: [120, 135, 142, 138, 125]
      }
    }
  ];

  return mockExercises;
}

// Exercise service functions
export async function createExercise(formData: ExerciseFormData, userId: string): Promise<Exercise> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newExercise: Exercise = {
    id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: formData.type,
    name: formData.name.trim(),
    duration: formData.duration,
    intensity: formData.intensity,
    date: new Date(formData.date),
    notes: formData.notes.trim() || undefined,
    caloriesBurned: formData.caloriesBurned || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    typeSpecificData: formData.typeSpecificData
  };

  const exercises = getStoredExercises();
  exercises.unshift(newExercise); // Add to beginning
  saveExercises(exercises);

  return newExercise;
}

export async function getExercises(userId: string, filters?: ExerciseFilters): Promise<Exercise[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  let exercises = getStoredExercises().filter(ex => ex.userId === userId);

  // Note: Mock data generation disabled - users will start with empty state
  // This ensures new exercise entries are properly displayed without confusion
  // if (exercises.length === 0) {
  //   const mockExercises = generateMockExercises(userId);
  //   saveExercises(mockExercises);
  //   exercises = mockExercises;
  // }

  // Apply filters
  if (filters) {
    if (filters.type) {
      exercises = exercises.filter(ex => ex.type === filters.type);
    }
    
    if (filters.intensity) {
      exercises = exercises.filter(ex => ex.intensity === filters.intensity);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(query) ||
        ex.notes?.toLowerCase().includes(query) ||
        ex.type.toLowerCase().includes(query)
      );
    }
    
    if (filters.dateRange) {
      exercises = exercises.filter(ex => 
        ex.date >= filters.dateRange!.start && 
        ex.date <= filters.dateRange!.end
      );
    }
  }

  // Sort by date (most recent first)
  return exercises.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function updateExercise(exerciseId: string, updates: Partial<ExerciseFormData>): Promise<Exercise> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const exercises = getStoredExercises();
  const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);

  if (exerciseIndex === -1) {
    throw new Error('Exercise not found');
  }

  const updatedExercise = {
    ...exercises[exerciseIndex],
    ...updates,
    date: updates.date ? new Date(updates.date) : exercises[exerciseIndex].date,
    updatedAt: new Date()
  };

  exercises[exerciseIndex] = updatedExercise;
  saveExercises(exercises);

  return updatedExercise;
}

export async function deleteExercise(exerciseId: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const exercises = getStoredExercises();
  const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
  
  if (filteredExercises.length === exercises.length) {
    throw new Error('Exercise not found');
  }
  
  saveExercises(filteredExercises);
}

export async function getExerciseStats(userId: string): Promise<ExerciseStats> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const exercises = await getExercises(userId);
  
  if (exercises.length === 0) {
    return {
      totalExercises: 0,
      totalDuration: 0,
      averageIntensity: 0,
      favoriteType: ExerciseType.CARDIO,
      currentStreak: 0,
      longestStreak: 0,
      weeklyGoalProgress: 0,
      exercisesThisWeek: 0,
      exercisesThisMonth: 0,
      exercisesByType: {} as Record<ExerciseType, number>,
      intensityDistribution: {} as Record<IntensityLevel, number>,
      weeklyData: []
    };
  }

  const totalExercises = exercises.length;
  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  
  // Calculate average intensity (convert to numeric scale)
  const intensityValues = {
    [IntensityLevel.LOW]: 1,
    [IntensityLevel.MODERATE]: 2,
    [IntensityLevel.HIGH]: 3,
    [IntensityLevel.MAXIMUM]: 4
  };
  const averageIntensity = exercises.reduce((sum, ex) => sum + intensityValues[ex.intensity], 0) / exercises.length;
  
  // Count exercises by type
  const exercisesByType = exercises.reduce((counts, ex) => {
    counts[ex.type] = (counts[ex.type] || 0) + 1;
    return counts;
  }, {} as Record<ExerciseType, number>);
  
  // Find favorite type
  const favoriteType = Object.entries(exercisesByType).reduce((a, b) => 
    exercisesByType[a[0] as ExerciseType] > exercisesByType[b[0] as ExerciseType] ? a : b
  )[0] as ExerciseType;

  // Count exercises by intensity
  const intensityDistribution = exercises.reduce((counts, ex) => {
    counts[ex.intensity] = (counts[ex.intensity] || 0) + 1;
    return counts;
  }, {} as Record<IntensityLevel, number>);

  // Calculate streaks
  const today = new Date();
  const uniqueDates = Array.from(new Set(exercises.map(ex => ex.date.toDateString())))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const exerciseDate = new Date(uniqueDates[i]);
    const daysDiff = Math.floor((today.getTime() - exerciseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (i === 0 && daysDiff <= 1) {
      currentStreak = 1;
      tempStreak = 1;
    } else if (i > 0) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const daysBetween = Math.floor((prevDate.getTime() - exerciseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween === 1) {
        tempStreak++;
        if (i === 1 && daysDiff <= 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Calculate this week's exercises
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const exercisesThisWeek = exercises.filter(ex => ex.date >= weekStart).length;

  // Calculate this month's exercises
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const exercisesThisMonth = exercises.filter(ex => ex.date >= monthStart).length;

  // Calculate weekly goal progress (assuming 5 exercises per week)
  const weeklyGoalProgress = Math.min(100, (exercisesThisWeek / 5) * 100);

  // Generate weekly data for the last 14 days
  const weeklyData = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    const dayExercises = exercises.filter(ex => 
      ex.date >= date && ex.date < nextDay
    );
    
    weeklyData.push({
      date: date.toISOString(),
      exercises: dayExercises.length,
      duration: dayExercises.reduce((sum, ex) => sum + ex.duration, 0)
    });
  }

  return {
    totalExercises,
    totalDuration,
    averageIntensity,
    favoriteType,
    currentStreak,
    longestStreak,
    weeklyGoalProgress,
    exercisesThisWeek,
    exercisesThisMonth,
    exercisesByType,
    intensityDistribution,
    weeklyData
  };
}

// Get default type-specific data for forms
export function getDefaultTypeData(type: ExerciseType): Partial<Exercise['typeSpecificData']> {
  switch (type) {
    case ExerciseType.HIIT:
      return {
        rounds: 0,
        workInterval: 0,
        restInterval: 0
      };
    case ExerciseType.WEIGHTLIFTING:
    case ExerciseType.ARMS:
      return {
        exercises: [],
        totalWeight: 0
      };
    case ExerciseType.CARDIO:
      return {
        distance: 0,
        pace: 0,
        heartRate: []
      };
    case ExerciseType.SPORTS:
      return {
        sport: '',
        score: '',
        opponent: ''
      };
    default:
      return {};
  }
}

// Default export object
const exerciseService = {
  createExercise,
  getExercises,
  updateExercise,
  deleteExercise,
  getExerciseStats,
  getDefaultTypeData
};

export default exerciseService;