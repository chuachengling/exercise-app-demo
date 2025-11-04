'use client';

import { useState } from 'react';
import { Exercise, ExerciseType } from '@/lib/types/exercise';
import { EXERCISE_TYPES, getExerciseTypeInfo, getIntensityInfo } from '@/lib/data/exerciseTypes';
import { Trash2, Eye, Calendar, Clock, Zap, MapPin, Target, Weight, Users } from 'lucide-react';

interface ExerciseHistoryProps {
  exercises: Exercise[];
  onExerciseDeleted: (exerciseId: string) => void;
  compact?: boolean;
}

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const exerciseType = getExerciseTypeInfo(exercise.type);
  const intensityInfo = getIntensityInfo(exercise.intensity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${exerciseType?.color} flex items-center justify-center text-white text-xl`}>
                {exerciseType?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{exercise.name}</h2>
                <p className="text-gray-600">{exerciseType?.label} • {new Date(exercise.date).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{exercise.duration}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{intensityInfo?.label}</div>
              <div className="text-sm text-gray-600">Intensity</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{new Date(exercise.date).getDate()}</div>
              <div className="text-sm text-gray-600">{new Date(exercise.date).toLocaleDateString('en-US', { month: 'short' })}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{exercise.caloriesBurned || 'N/A'}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
          </div>

          {/* Type-Specific Details */}
          {exercise.typeSpecificData && Object.keys(exercise.typeSpecificData).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
              
              {/* HIIT Details */}
              {exercise.type === ExerciseType.HIIT && exercise.typeSpecificData.rounds && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{exercise.typeSpecificData.rounds}</div>
                    <div className="text-sm text-orange-700">Rounds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{exercise.typeSpecificData.workInterval}s</div>
                    <div className="text-sm text-orange-700">Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{exercise.typeSpecificData.restInterval}s</div>
                    <div className="text-sm text-orange-700">Rest</div>
                  </div>
                </div>
              )}

              {/* Weightlifting/Arms Details */}
              {(exercise.type === ExerciseType.WEIGHTLIFTING || exercise.type === ExerciseType.ARMS) && exercise.typeSpecificData.exercises && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Weight className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Total Weight: {exercise.typeSpecificData.totalWeight} lbs</span>
                  </div>
                  <div className="space-y-2">
                    {exercise.typeSpecificData.exercises.map((ex: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{ex.name}</span>
                        <span className="text-gray-600">{ex.sets} sets × {ex.reps} reps @ {ex.weight} lbs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cardio Details */}
              {exercise.type === ExerciseType.CARDIO && exercise.typeSpecificData.distance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600">{exercise.typeSpecificData.distance}</div>
                    <div className="text-sm text-blue-700">Miles</div>
                  </div>
                  {exercise.typeSpecificData.pace && (
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">{exercise.typeSpecificData.pace}</div>
                      <div className="text-sm text-blue-700">Min/Mile</div>
                    </div>
                  )}
                  {exercise.typeSpecificData.heartRate && exercise.typeSpecificData.heartRate.length > 0 && (
                    <div className="text-center">
                      <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">{Math.round(exercise.typeSpecificData.heartRate.reduce((a, b) => a + b, 0) / exercise.typeSpecificData.heartRate.length)}</div>
                      <div className="text-sm text-blue-700">Avg BPM</div>
                    </div>
                  )}
                </div>
              )}

              {/* Sports Details */}
              {exercise.type === ExerciseType.SPORTS && exercise.typeSpecificData.sport && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-indigo-700">Sport: {exercise.typeSpecificData.sport}</span>
                  </div>
                  {exercise.typeSpecificData.score && (
                    <div className="mb-2">
                      <span className="text-indigo-700">Score: <span className="font-medium">{exercise.typeSpecificData.score}</span></span>
                    </div>
                  )}
                  {exercise.typeSpecificData.opponent && (
                    <div>
                      <span className="text-indigo-700">Opponent: <span className="font-medium">{exercise.typeSpecificData.opponent}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{exercise.notes}</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseHistory({ exercises, onExerciseDeleted, compact = false }: ExerciseHistoryProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    setDeletingId(exerciseId);
    try {
      await onExerciseDeleted(exerciseId);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const groupExercisesByDate = (exercises: Exercise[]) => {
    const groups: { [key: string]: Exercise[] } = {};
    
    exercises.forEach(exercise => {
      const date = new Date(exercise.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(exercise);
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises yet</h3>
        <p className="text-gray-600">Start tracking your workouts to see them here!</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {exercises.map(exercise => {
          const exerciseType = getExerciseTypeInfo(exercise.type);
          
          return (
            <div key={exercise.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${exerciseType?.color} flex items-center justify-center text-white`}>
                  {exerciseType?.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exercise.duration} min • {exercise.intensity} • {exerciseType?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{new Date(exercise.date).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedExercise(exercise)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        
        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </div>
    );
  }

  const exerciseGroups = groupExercisesByDate(exercises);

  return (
    <div className="space-y-6">
      {exerciseGroups.map(([date, dayExercises]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {dayExercises.length} exercise{dayExercises.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {dayExercises.map(exercise => {
              const exerciseType = getExerciseTypeInfo(exercise.type);
              const intensityInfo = getIntensityInfo(exercise.intensity);
              
              return (
                <div key={exercise.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${exerciseType?.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                        {exerciseType?.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{exercise.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${intensityInfo?.color}`}>
                            {intensityInfo?.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exercise.duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {exerciseType?.label}
                          </div>
                          {exercise.caloriesBurned && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {exercise.caloriesBurned} cal
                            </div>
                          )}
                        </div>

                        {/* Quick type-specific info */}
                        {exercise.typeSpecificData && (
                          <div className="text-sm text-gray-600">
                            {exercise.type === ExerciseType.HIIT && exercise.typeSpecificData.rounds && (
                              <span>{exercise.typeSpecificData.rounds} rounds • {exercise.typeSpecificData.workInterval}s work / {exercise.typeSpecificData.restInterval}s rest</span>
                            )}
                            {(exercise.type === ExerciseType.WEIGHTLIFTING || exercise.type === ExerciseType.ARMS) && exercise.typeSpecificData.totalWeight && (
                              <span>{exercise.typeSpecificData.totalWeight} lbs total weight</span>
                            )}
                            {exercise.type === ExerciseType.CARDIO && exercise.typeSpecificData.distance && (
                              <span>{exercise.typeSpecificData.distance} miles{exercise.typeSpecificData.pace && ` @ ${exercise.typeSpecificData.pace} min/mile`}</span>
                            )}
                            {exercise.type === ExerciseType.SPORTS && exercise.typeSpecificData.sport && (
                              <span>{exercise.typeSpecificData.sport}{exercise.typeSpecificData.score && ` • Score: ${exercise.typeSpecificData.score}`}</span>
                            )}
                          </div>
                        )}

                        {exercise.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{exercise.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedExercise(exercise)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        disabled={deletingId === exercise.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === exercise.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}