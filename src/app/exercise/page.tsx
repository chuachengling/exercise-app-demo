'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar, TrendingUp } from 'lucide-react';
import { Exercise, ExerciseType, ExerciseStats } from '@/lib/types/exercise';
import exerciseService from '@/lib/services/exerciseService';
import { EXERCISE_TYPES } from '@/lib/data/exerciseTypes';
import ExerciseForm from '@/components/exercise/ExerciseForm';
import ExerciseHistory from '@/components/exercise/ExerciseHistory';
import ExerciseStatsDisplay from '@/components/exercise/ExerciseStatsDisplay';
import Timer from '@/components/exercise/Timer';

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'add' | 'history' | 'timer'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ExerciseType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [exerciseData, statsData] = await Promise.all([
        exerciseService.getExercises('current-user'),
        exerciseService.getExerciseStats('current-user')
      ]);
      setExercises(exerciseData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load exercise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseAdded = (exercise: Exercise) => {
    setExercises(prev => [exercise, ...prev]);
    setActiveView('overview');
    loadData(); // Refresh stats
  };

  const handleExerciseDeleted = async (exerciseId: string) => {
    try {
      await exerciseService.deleteExercise(exerciseId);
      setExercises(prev => prev.filter(e => e.id !== exerciseId));
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      throw error;
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exercise.type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your exercise data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Tracker</h1>
              <p className="mt-1 text-gray-600">Track your workouts and monitor your progress</p>
            </div>
            <button
              onClick={() => setActiveView('add')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'add', label: 'Add Exercise', icon: Plus },
                { id: 'history', label: 'History', icon: Calendar },
                { id: 'timer', label: 'Timer', icon: Calendar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Exercise Type Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {EXERCISE_TYPES.map(type => (
                  <button
                    key={type.type}
                    onClick={() => {
                      setSelectedType(type.type);
                      setActiveView('add');
                    }}
                    className={`p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all group hover:shadow-md`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center text-white text-xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                      {type.icon}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{type.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <ExerciseStatsDisplay stats={stats} />
            )}

            {/* Recent Exercises */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Exercises</h2>
                <button
                  onClick={() => setActiveView('history')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All
                </button>
              </div>
              <ExerciseHistory
                exercises={exercises.slice(0, 5)}
                onExerciseDeleted={handleExerciseDeleted}
                compact={true}
              />
            </div>
          </div>
        )}

        {activeView === 'add' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ExerciseForm
              onExerciseAdded={handleExerciseAdded}
              onCancel={() => {
                setActiveView('overview');
                setSelectedType(null);
              }}
              initialType={selectedType}
            />
          </div>
        )}

        {activeView === 'history' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as ExerciseType | 'all')}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                  >
                    <option value="all">All Types</option>
                    {EXERCISE_TYPES.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Exercise History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Exercise History</h2>
              <ExerciseHistory
                exercises={filteredExercises}
                onExerciseDeleted={handleExerciseDeleted}
              />
            </div>
          </div>
        )}

        {activeView === 'timer' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Timer />
          </div>
        )}
      </div>
    </div>
  );
}