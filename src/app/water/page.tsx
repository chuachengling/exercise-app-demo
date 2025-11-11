'use client';

import { useState, useEffect } from 'react';
import { Droplet, Settings, BarChart3, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { WaterEntry, WaterGoal, DailyWaterStats, WaterUnit, WaterFormData } from '@/lib/types/water';
import waterService from '@/lib/services/waterService';
import QuickAddWater from './_components/QuickAddWater';
import WaterProgressCard from './_components/WaterProgressCard';
import WaterHistory from './_components/WaterHistory';
import WaterStats from './_components/WaterStats';
import WaterGoalSettings from './_components/WaterGoalSettings';
import { startOfWeek } from 'date-fns';

type TabType = 'log' | 'stats' | 'history';

export default function WaterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyWaterStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyWaterStats[]>([]);
  const [goal, setGoal] = useState<WaterGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadWaterData();
    }
  }, [user?.id]);

  const loadWaterData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = startOfWeek(today, { weekStartsOn: 0 });

      const [entriesData, statsData, weekData, goalData] = await Promise.all([
        waterService.getWaterEntries(user.id),
        waterService.getDailyStats(user.id, today),
        waterService.getWeeklyStats(user.id, weekStart),
        waterService.getWaterGoal(user.id)
      ]);

      setEntries(entriesData);
      setDailyStats(statsData);
      setWeeklyStats(weekData);
      setGoal(goalData);
    } catch (error) {
      console.error('Failed to load water data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWater = async (data: WaterFormData) => {
    if (!user?.id) return;

    try {
      const newEntry = await waterService.createWaterEntry(data, user.id);
      setEntries(prev => [newEntry, ...prev]);

      // Reload stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stats = await waterService.getDailyStats(user.id, today);
      setDailyStats(stats);

      // Update weekly stats
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekData = await waterService.getWeeklyStats(user.id, weekStart);
      setWeeklyStats(weekData);
    } catch (error) {
      console.error('Failed to add water entry:', error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user?.id) return;

    try {
      await waterService.deleteWaterEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));

      // Reload stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stats = await waterService.getDailyStats(user.id, today);
      setDailyStats(stats);

      // Update weekly stats
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekData = await waterService.getWeeklyStats(user.id, weekStart);
      setWeeklyStats(weekData);
    } catch (error) {
      console.error('Failed to delete water entry:', error);
      throw error;
    }
  };

  const handleSaveGoal = async (updates: Partial<Omit<WaterGoal, 'userId'>>) => {
    if (!user?.id) return;

    try {
      const updatedGoal = await waterService.updateWaterGoal(user.id, updates);
      setGoal(updatedGoal);

      // Reload stats with new goal
      await loadWaterData();
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  };

  const tabs = [
    { id: 'log' as TabType, label: 'Log Water', icon: Droplet },
    { id: 'stats' as TabType, label: 'Statistics', icon: BarChart3 },
    { id: 'history' as TabType, label: 'History', icon: HistoryIcon },
  ];

  const preferredUnit = goal?.unit || WaterUnit.ML;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Water Tracking</h1>
                <p className="text-sm text-gray-600">Stay hydrated and healthy</p>
              </div>
            </div>
            <button
              onClick={() => setShowGoalSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Settings className="w-4 h-4" />
              Goal Settings
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'log' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QuickAddWater onAddWater={handleAddWater} isLoading={isLoading} />
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Entries</h2>
                {dailyStats?.entries && dailyStats.entries.length > 0 ? (
                  <div className="space-y-3">
                    {dailyStats.entries.map(entry => (
                      <div key={entry.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Droplet className="w-5 h-5 text-blue-500" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {waterService.formatWaterAmount(entry.amount, preferredUnit)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                    No entries today. Add your first water intake!
                  </div>
                )}
              </div>
            </div>

            <div>
              <WaterProgressCard
                stats={dailyStats}
                isLoading={isLoading}
                preferredUnit={preferredUnit}
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <WaterStats
            weeklyStats={weeklyStats}
            preferredUnit={preferredUnit}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'history' && (
          <WaterHistory
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
            preferredUnit={preferredUnit}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Goal Settings Modal */}
      {showGoalSettings && goal && (
        <WaterGoalSettings
          goal={goal}
          onSave={handleSaveGoal}
          onClose={() => setShowGoalSettings(false)}
        />
      )}
    </div>
  );
}
