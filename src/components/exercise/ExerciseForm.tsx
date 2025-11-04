'use client';

import { useState, useEffect } from 'react';
import { ExerciseType, ExerciseFormData, IntensityLevel } from '@/lib/types/exercise';
import { EXERCISE_TYPES, INTENSITY_LEVELS, COMMON_EXERCISES, EXERCISE_TIPS } from '@/lib/data/exerciseTypes';
import exerciseService from '@/lib/services/exerciseService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Plus, Minus, Clock, Save, X, AlertCircle } from 'lucide-react';

interface ExerciseFormProps {
  onExerciseAdded: (exercise: any) => void;
  onCancel: () => void;
  initialType?: ExerciseType | null;
}

interface ExerciseEntry {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function ExerciseForm({ onExerciseAdded, onCancel, initialType }: ExerciseFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    type: initialType || ExerciseType.HIIT,
    duration: 0,
    intensity: IntensityLevel.MODERATE,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    caloriesBurned: 0,
    typeSpecificData: {}
  });

  const [exercises, setExercises] = useState<ExerciseEntry[]>([{ name: '', sets: 0, reps: 0, weight: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTips, setShowTips] = useState(false);

  // Update type-specific data when exercise type changes
  useEffect(() => {
    const defaultData = exerciseService.getDefaultTypeData(formData.type);
    setFormData(prev => ({
      ...prev,
      typeSpecificData: defaultData
    }));

    // Reset exercises for weightlifting/arms types
    if (formData.type === ExerciseType.WEIGHTLIFTING || formData.type === ExerciseType.ARMS) {
      setExercises([{ name: '', sets: 0, reps: 0, weight: 0 }]);
    }
  }, [formData.type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    // Type-specific validation
    switch (formData.type) {
      case ExerciseType.HIIT:
        if (!formData.typeSpecificData.rounds || formData.typeSpecificData.rounds <= 0) {
          newErrors.rounds = 'Number of rounds is required';
        }
        if (!formData.typeSpecificData.workInterval || formData.typeSpecificData.workInterval <= 0) {
          newErrors.workInterval = 'Work interval is required';
        }
        if (!formData.typeSpecificData.restInterval || formData.typeSpecificData.restInterval <= 0) {
          newErrors.restInterval = 'Rest interval is required';
        }
        break;

      case ExerciseType.WEIGHTLIFTING:
      case ExerciseType.ARMS:
        const validExercises = exercises.filter(ex => ex.name.trim() && ex.sets > 0 && ex.reps > 0);
        if (validExercises.length === 0) {
          newErrors.exercises = 'At least one exercise with sets and reps is required';
        }
        break;

      case ExerciseType.CARDIO:
        if (!formData.typeSpecificData.distance || formData.typeSpecificData.distance <= 0) {
          newErrors.distance = 'Distance is required for cardio exercises';
        }
        break;

      case ExerciseType.SPORTS:
        if (!formData.typeSpecificData.sport?.trim()) {
          newErrors.sport = 'Sport name is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Prepare type-specific data
      let typeSpecificData = { ...formData.typeSpecificData };
      
      if (formData.type === ExerciseType.WEIGHTLIFTING || formData.type === ExerciseType.ARMS) {
        const validExercises = exercises.filter(ex => ex.name.trim() && ex.sets > 0 && ex.reps > 0);
        const totalWeight = validExercises.reduce((sum, ex) => sum + (ex.weight * ex.sets * ex.reps), 0);
        
        const exerciseSets: any[] = validExercises.map(ex => ({
          exercise: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: 60 // Default rest time
        }));
        
        typeSpecificData = {
          ...typeSpecificData,
          exercises: exerciseSets,
          totalWeight
        };
      }

      const exerciseData: ExerciseFormData = {
        ...formData,
        typeSpecificData
      };

      const exercise = await exerciseService.createExercise(exerciseData, user.id);
      onExerciseAdded(exercise);
    } catch (error) {
      console.error('Failed to create exercise:', error);
      setErrors({ submit: 'Failed to save exercise. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 0, reps: 0, weight: 0 }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index: number, field: keyof ExerciseEntry, value: string | number) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    setExercises(updated);
  };

  const selectedExerciseType = EXERCISE_TYPES.find(et => et.type === formData.type);
  const commonExercises = COMMON_EXERCISES[formData.type] || [];
  const tips = EXERCISE_TIPS[formData.type] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Exercise</h2>
          <p className="text-gray-600">Record your workout details and track your progress</p>
        </div>
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
        >
          <AlertCircle className="w-4 h-4" />
          {showTips ? 'Hide Tips' : 'Show Tips'}
        </button>
      </div>

      {/* Exercise Tips */}
      {showTips && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Tips for {selectedExerciseType?.label}</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ExerciseType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EXERCISE_TYPES.map(type => (
                  <option key={type.type} value={type.type}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter exercise name"
                list="common-exercises"
              />
              <datalist id="common-exercises">
                {commonExercises.map(exercise => (
                  <option key={exercise} value={exercise} />
                ))}
              </datalist>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
              </div>
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity Level
              </label>
              <select
                value={formData.intensity}
                onChange={(e) => setFormData(prev => ({ ...prev, intensity: e.target.value as IntensityLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INTENSITY_LEVELS.map(level => (
                  <option key={level.level} value={level.level}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Type-Specific Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {selectedExerciseType?.label} Details
          </h3>

          {/* HIIT Specific Fields */}
          {formData.type === ExerciseType.HIIT && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rounds *
                </label>
                <input
                  type="number"
                  value={formData.typeSpecificData.rounds || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, rounds: parseInt(e.target.value) || 0 }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rounds ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
                {errors.rounds && <p className="mt-1 text-sm text-red-600">{errors.rounds}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Interval (seconds) *
                </label>
                <input
                  type="number"
                  value={formData.typeSpecificData.workInterval || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, workInterval: parseInt(e.target.value) || 0 }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.workInterval ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
                {errors.workInterval && <p className="mt-1 text-sm text-red-600">{errors.workInterval}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rest Interval (seconds) *
                </label>
                <input
                  type="number"
                  value={formData.typeSpecificData.restInterval || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, restInterval: parseInt(e.target.value) || 0 }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.restInterval ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
                {errors.restInterval && <p className="mt-1 text-sm text-red-600">{errors.restInterval}</p>}
              </div>
            </div>
          )}

          {/* Weightlifting/Arms Specific Fields */}
          {(formData.type === ExerciseType.WEIGHTLIFTING || formData.type === ExerciseType.ARMS) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-700">Exercises</h4>
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>
              
              {exercises.map((exercise, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Exercise name"
                      list={`common-exercises-${formData.type}`}
                    />
                    <datalist id={`common-exercises-${formData.type}`}>
                      {commonExercises.map(ex => (
                        <option key={ex} value={ex} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {errors.exercises && <p className="text-sm text-red-600">{errors.exercises}</p>}
            </div>
          )}

          {/* Cardio Specific Fields */}
          {formData.type === ExerciseType.CARDIO && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (miles) *
                </label>
                <input
                  type="number"
                  value={formData.typeSpecificData.distance || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, distance: parseFloat(e.target.value) || 0 }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.distance ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
                {errors.distance && <p className="mt-1 text-sm text-red-600">{errors.distance}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pace (min/mile)
                </label>
                <input
                  type="number"
                  value={formData.typeSpecificData.pace || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, pace: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Heart Rate
                </label>
                <input
                  type="number"
                  value={Array.isArray(formData.typeSpecificData.heartRate) && formData.typeSpecificData.heartRate.length > 0 
                    ? Math.round(formData.typeSpecificData.heartRate.reduce((a, b) => a + b, 0) / formData.typeSpecificData.heartRate.length)
                    : ''}
                  onChange={(e) => {
                    const avgHR = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      typeSpecificData: { ...prev.typeSpecificData, heartRate: avgHR > 0 ? [avgHR] : [] }
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Sports Specific Fields */}
          {formData.type === ExerciseType.SPORTS && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <input
                  type="text"
                  value={formData.typeSpecificData.sport || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, sport: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sport ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter sport name"
                  list="common-sports"
                />
                <datalist id="common-sports">
                  {commonExercises.map(sport => (
                    <option key={sport} value={sport} />
                  ))}
                </datalist>
                {errors.sport && <p className="mt-1 text-sm text-red-600">{errors.sport}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score
                </label>
                <input
                  type="text"
                  value={formData.typeSpecificData.score || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, score: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3-2, 21-15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opponent/Team
                </label>
                <input
                  type="text"
                  value={formData.typeSpecificData.opponent || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    typeSpecificData: { ...prev.typeSpecificData, opponent: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opponent or team name"
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional notes about your workout..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          {errors.submit && (
            <div className="flex-1">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
}