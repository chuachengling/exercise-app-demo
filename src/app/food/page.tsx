'use client';

import { useState, useEffect } from 'react';
import { FoodEntry, MealType, DailyNutritionStats } from '@/lib/types/food';
import { useAuth } from '@/lib/contexts/AuthContext';
import foodService from '@/lib/services/foodService';
import { Plus, UtensilsCrossed, Calendar, TrendingUp } from 'lucide-react';
import FoodForm from './_components/FoodForm';
import FoodHistory from './_components/FoodHistory';
import FoodStats from './_components/FoodStats';

export default function FoodPage() {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [stats, setStats] = useState<DailyNutritionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'history'>('log');
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'ALL'>('ALL');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, selectedDate, searchQuery, mealTypeFilter]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Build filters
      const filters: any = {};
      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }
      if (mealTypeFilter !== 'ALL') {
        filters.mealType = mealTypeFilter;
      }
      
      const [entriesData, statsData] = await Promise.all([
        foodService.getFoodEntries(user.id, Object.keys(filters).length > 0 ? filters : undefined),
        foodService.getDailyStats(user.id, selectedDate)
      ]);
      setFoodEntries(entriesData);
      setStats(statsData);
      console.log('Loaded food entries:', entriesData.length);
    } catch (error) {
      console.error('Failed to load food data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = async (entry: FoodEntry) => {
    setEditingEntry(null);
    setShowForm(false);
    
    // Reload data immediately with the entry's date for stats
    if (user?.id) {
      setIsLoading(true);
      try {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        
        // Build filters
        const filters: any = {};
        if (searchQuery) {
          filters.searchQuery = searchQuery;
        }
        if (mealTypeFilter !== 'ALL') {
          filters.mealType = mealTypeFilter;
        }
        
        const [entriesData, statsData] = await Promise.all([
          foodService.getFoodEntries(user.id, Object.keys(filters).length > 0 ? filters : undefined),
          foodService.getDailyStats(user.id, entryDate)
        ]);
        setFoodEntries(entriesData);
        setStats(statsData);
        setSelectedDate(entryDate); // Update selected date to match the entry
        console.log('Reloaded after save - entries:', entriesData.length, 'stats for date:', entryDate);
      } catch (error) {
        console.error('Failed to reload food data after save:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEntry = () => {
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleEditEntry = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
    setActiveTab('log');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user?.id) return;
    
    try {
      await foodService.deleteFoodEntry(entryId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
    setActiveTab('log');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to track your food intake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UtensilsCrossed className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Food Tracking</h1>
              </div>
              <p className="text-gray-600">Track your daily food intake and nutrition</p>
            </div>
            {activeTab !== 'log' && (
              <button
                onClick={handleNewEntry}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Log Food</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters - Show on stats and history tabs */}
        {(activeTab === 'stats' || activeTab === 'history') && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Search */}
              {activeTab === 'history' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search food or notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Meal Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={mealTypeFilter}
                      onChange={(e) => setMealTypeFilter(e.target.value as MealType | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="ALL">All Meals</option>
                      <option value={MealType.BREAKFAST}>Breakfast</option>
                      <option value={MealType.LUNCH}>Lunch</option>
                      <option value={MealType.DINNER}>Dinner</option>
                      <option value={MealType.SNACK}>Snack</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('log')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'log'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Log Food</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Today's Stats</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            {showForm || editingEntry ? (
              <FoodForm
                editingEntry={editingEntry}
                onFoodAdded={handleSaveEntry}
                onCancel={handleCancelEntry}
              />
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Log a Meal
                </h3>
                <p className="text-gray-600 mb-6">
                  Track your food intake and monitor your nutrition
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Start Logging</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <FoodStats stats={stats || {
              date: new Date(),
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFats: 0,
              mealCount: 0,
              entriesByMealType: {
                BREAKFAST: [],
                LUNCH: [],
                DINNER: [],
                SNACK: []
              }
            }} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : foodEntries.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No food entries yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your nutrition by logging your first meal
                </p>
                <button
                  onClick={handleNewEntry}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Log Your First Meal</span>
                </button>
              </div>
            ) : (
              <FoodHistory
                entries={foodEntries}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
