'use client';

import { useState } from 'react';
import exerciseService from '@/lib/services/exerciseService';
import { ExerciseType, IntensityLevel } from '@/lib/types/exercise';

export default function TestExerciseFlow() {
  const [status, setStatus] = useState('');
  const [exercises, setExercises] = useState([]);

  const createTestExercise = async () => {
    setStatus('Creating test exercise...');
    try {
      const exerciseData = {
        type: ExerciseType.HIIT,
        name: 'Debug Test Exercise',
        duration: 25,
        intensity: IntensityLevel.HIGH,
        date: new Date().toISOString(),
        notes: 'Created from debug component',
        typeSpecificData: {
          rounds: 3,
          workInterval: 40,
          restInterval: 20
        }
      };

      const result = await exerciseService.createExercise(exerciseData, 'debug-user');
      setStatus(`Exercise created: ${result.name}`);
      console.log('Created exercise:', result);
      
      // Load exercises to verify
      loadExercises();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Error creating exercise:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const allExercises = await exerciseService.getExercises('debug-user');
      setExercises(allExercises);
      console.log('Loaded exercises:', allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const clearData = () => {
    localStorage.removeItem('exercises');
    setExercises([]);
    setStatus('Data cleared');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Exercise Flow Debug</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={createTestExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Test Exercise
          </button>
          <button
            onClick={loadExercises}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Load Exercises
          </button>
          <button
            onClick={clearData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Data
          </button>
        </div>

        {status && (
          <div className="p-3 bg-gray-100 rounded">
            Status: {status}
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Loaded Exercises ({exercises.length}):</h3>
          {exercises.length > 0 ? (
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="p-2 bg-gray-50 rounded text-sm">
                  <strong>{ex.name}</strong> - {ex.type} - {ex.duration}min
                  <br />
                  <span className="text-gray-600">
                    {new Date(ex.date).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No exercises found</p>
          )}
        </div>
      </div>
    </div>
  );
}