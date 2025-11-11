'use client';

import { useState, useEffect } from 'react';
import { X, Target, Save } from 'lucide-react';
import { WaterGoal, WaterUnit } from '@/lib/types/water';
import { convertUnit } from '@/lib/services/waterService';

interface WaterGoalSettingsProps {
  goal: WaterGoal;
  onSave: (updates: Partial<Omit<WaterGoal, 'userId'>>) => Promise<void>;
  onClose: () => void;
}

export default function WaterGoalSettings({ goal, onSave, onClose }: WaterGoalSettingsProps) {
  const [goalAmount, setGoalAmount] = useState('');
  const [unit, setUnit] = useState<WaterUnit>(goal.unit);
  const [reminderEnabled, setReminderEnabled] = useState(goal.reminderEnabled);
  const [reminderInterval, setReminderInterval] = useState(goal.reminderIntervalHours?.toString() || '2');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Convert current goal to display unit
    const converted = convertUnit(goal.dailyGoalMl, WaterUnit.ML, unit);
    setGoalAmount(Math.round(converted).toString());
  }, [goal.dailyGoalMl, unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const amount = parseFloat(goalAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid goal amount');
        setIsSaving(false);
        return;
      }

      // Convert to ml
      const amountInMl = Math.round(convertUnit(amount, unit, WaterUnit.ML));

      if (amountInMl < 500 || amountInMl > 10000) {
        setError('Goal must be between 500ml and 10000ml');
        setIsSaving(false);
        return;
      }

      const updates: Partial<Omit<WaterGoal, 'userId'>> = {
        dailyGoalMl: amountInMl,
        unit,
        reminderEnabled,
      };

      if (reminderEnabled) {
        const interval = parseInt(reminderInterval);
        if (isNaN(interval) || interval < 1 || interval > 12) {
          setError('Reminder interval must be between 1 and 12 hours');
          setIsSaving(false);
          return;
        }
        updates.reminderIntervalHours = interval;
      }

      await onSave(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
      setIsSaving(false);
    }
  };

  // Recommended goals based on common standards
  const recommendedGoals = [
    { label: 'Light (1.5L)', ml: 1500 },
    { label: 'Standard (2L)', ml: 2000 },
    { label: 'Active (2.5L)', ml: 2500 },
    { label: 'Athletic (3L)', ml: 3000 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Water Goal Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {recommendedGoals.map(preset => (
                <button
                  key={preset.ml}
                  type="button"
                  onClick={() => {
                    const converted = convertUnit(preset.ml, WaterUnit.ML, unit);
                    setGoalAmount(Math.round(converted).toString());
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
                  disabled={isSaving}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Goal */}
          <div>
            <label htmlFor="goal-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Daily Water Goal
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  id="goal-amount"
                  type="number"
                  step="0.1"
                  min="1"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="w-32">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WaterUnit)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                >
                  <option value={WaterUnit.ML}>ml</option>
                  <option value={WaterUnit.OZ}>oz</option>
                  <option value={WaterUnit.CUPS}>cups</option>
                  <option value={WaterUnit.LITERS}>L</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Recommended: 2000ml (2 liters) per day
            </p>
          </div>

          {/* Reminders */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reminder-enabled"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSaving}
              />
              <label htmlFor="reminder-enabled" className="text-sm font-medium text-gray-700">
                Enable water reminders
              </label>
            </div>

            {reminderEnabled && (
              <div>
                <label htmlFor="reminder-interval" className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Interval (hours)
                </label>
                <input
                  id="reminder-interval"
                  type="number"
                  min="1"
                  max="12"
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll be reminded every {reminderInterval} hour{parseInt(reminderInterval) !== 1 ? 's' : ''} to drink water
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
