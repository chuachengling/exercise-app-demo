import { ExerciseType, IntensityLevel } from '@/lib/types/exercise';

export const EXERCISE_TYPES = [
  {
    type: ExerciseType.HIIT,
    label: 'HIIT',
    description: 'High-Intensity Interval Training',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
    fields: ['rounds', 'workInterval', 'restInterval']
  },
  {
    type: ExerciseType.WEIGHTLIFTING,
    label: 'Weightlifting',
    description: 'Strength training and resistance exercises',
    icon: '🏋️',
    color: 'from-green-500 to-emerald-600',
    fields: ['exercises', 'totalWeight']
  },
  {
    type: ExerciseType.CARDIO,
    label: 'Cardio',
    description: 'Cardiovascular endurance training',
    icon: '🏃',
    color: 'from-blue-500 to-cyan-600',
    fields: ['distance', 'pace', 'heartRate']
  },
  {
    type: ExerciseType.FLEXIBILITY,
    label: 'Flexibility',
    description: 'Stretching, yoga, and mobility work',
    icon: '🧘',
    color: 'from-purple-500 to-pink-600',
    fields: []
  },
  {
    type: ExerciseType.SPORTS,
    label: 'Sports',
    description: 'Team sports and recreational activities',
    icon: '⚽',
    color: 'from-indigo-500 to-purple-600',
    fields: ['sport', 'score', 'opponent']
  },
  {
    type: ExerciseType.ARMS,
    label: 'Arms Focus',
    description: 'Targeted arm and upper body exercises',
    icon: '💪',
    color: 'from-teal-500 to-green-600',
    fields: ['exercises', 'totalWeight']
  }
];

export const INTENSITY_LEVELS = [
  {
    level: IntensityLevel.LOW,
    label: 'Low',
    description: 'Light activity, easy breathing',
    color: 'text-green-600 bg-green-50',
    value: 1
  },
  {
    level: IntensityLevel.MODERATE,
    label: 'Moderate',
    description: 'Somewhat hard, can still talk',
    color: 'text-yellow-600 bg-yellow-50',
    value: 2
  },
  {
    level: IntensityLevel.HIGH,
    label: 'High',
    description: 'Hard work, difficult to talk',
    color: 'text-orange-600 bg-orange-50',
    value: 3
  },
  {
    level: IntensityLevel.MAXIMUM,
    label: 'Maximum',
    description: 'Very hard, cannot maintain long',
    color: 'text-red-600 bg-red-50',
    value: 4
  }
];

export const COMMON_EXERCISES = {
  [ExerciseType.HIIT]: [
    'Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees', 'Plank Jacks',
    'Jump Lunges', 'Russian Twists', 'Bicycle Crunches', 'Push-ups', 'Star Jumps'
  ],
  [ExerciseType.WEIGHTLIFTING]: [
    'Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Overhead Press',
    'Barbell Rows', 'Dips', 'Lunges', 'Lat Pulldowns', 'Shoulder Press'
  ],
  [ExerciseType.CARDIO]: [
    'Running', 'Cycling', 'Swimming', 'Rowing', 'Elliptical',
    'Stair Climbing', 'Dancing', 'Hiking', 'Jump Rope', 'Walking'
  ],
  [ExerciseType.FLEXIBILITY]: [
    'Yoga Flow', 'Static Stretching', 'Dynamic Stretching', 'Pilates',
    'Foam Rolling', 'Meditation', 'Tai Chi', 'Mobility Work'
  ],
  [ExerciseType.SPORTS]: [
    'Football', 'Basketball', 'Tennis', 'Badminton', 'Volleyball',
    'Table Tennis', 'Golf', 'Cricket', 'Baseball', 'Hockey'
  ],
  [ExerciseType.ARMS]: [
    'Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Tricep Dips',
    'Push-ups', 'Pull-ups', 'Chin-ups', 'Arm Circles', 'Resistance Band Work'
  ]
};

export const EXERCISE_TIPS = {
  [ExerciseType.HIIT]: [
    'Start with shorter intervals if you\'re a beginner',
    'Focus on proper form over speed',
    'Stay hydrated throughout the workout',
    'Allow adequate rest between sessions'
  ],
  [ExerciseType.WEIGHTLIFTING]: [
    'Always warm up before lifting heavy weights',
    'Focus on controlled movements',
    'Progressive overload is key to growth',
    'Don\'t skip rest days'
  ],
  [ExerciseType.CARDIO]: [
    'Start slowly and gradually increase intensity',
    'Monitor your heart rate',
    'Stay consistent with your routine',
    'Mix different types of cardio for variety'
  ],
  [ExerciseType.FLEXIBILITY]: [
    'Never force a stretch',
    'Hold stretches for at least 30 seconds',
    'Breathe deeply during stretches',
    'Stretch when muscles are warm'
  ],
  [ExerciseType.SPORTS]: [
    'Focus on having fun',
    'Learn proper techniques to avoid injury',
    'Play with people of similar skill levels',
    'Don\'t forget to cool down after playing'
  ],
  [ExerciseType.ARMS]: [
    'Balance pushing and pulling exercises',
    'Don\'t neglect your core',
    'Use proper grip and form',
    'Allow muscles to recover between sessions'
  ]
};

export function getExerciseTypeInfo(type: ExerciseType) {
  return EXERCISE_TYPES.find(et => et.type === type);
}

export function getIntensityInfo(level: IntensityLevel) {
  return INTENSITY_LEVELS.find(il => il.level === level);
}