'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { WaterUnit, WaterFormData } from '@/lib/types/water';
import { WATER_PRESETS } from '@/lib/data/waterPresets';
import { convertUnit } from '@/lib/services/waterService';

interface QuickAddWaterProps {
  onAddWater: (data: WaterFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function QuickAddWater({ onAddWater, isLoading = false }: QuickAddWaterProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customUnit, setCustomUnit] = useState<WaterUnit>(WaterUnit.ML);
  const [error, setError] = useState('');
  const [addingPreset, setAddingPreset] = useState<string | null>(null);

  const handlePresetClick = async (preset: typeof WATER_PRESETS[0]) => {
    setAddingPreset(preset.id);
    setError('');
    
    try {
      await onAddWater({
        amount: preset.amount,
        unit: WaterUnit.ML,
        presetType: preset.id
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add water');
    } finally {
      setAddingPreset(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(customAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Convert to ml for validation
    const amountInMl = convertUnit(amount, customUnit, WaterUnit.ML);
    
    if (amountInMl < 1 || amountInMl > 5000) {
      setError('Amount must be between 1ml and 5000ml');
      return;
    }
    
    try {
      await onAddWater({
        amount,
        unit: customUnit
      });
      
      setCustomAmount('');
      setShowCustomInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add water');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Quick Add Water</h2>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          disabled={isLoading}
        >
          {showCustomInput ? 'Use Presets' : 'Custom Amount'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!showCustomInput ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WATER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading || addingPreset === preset.id}
              className={`
                ${preset.color} text-white rounded-lg p-4 h-24
                flex flex-col items-center justify-center
                transition-all duration-200
                hover:scale-102 hover:shadow-lg
                active:scale-98
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              {addingPreset === preset.id ? (
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl mb-1">{preset.icon}</span>
                  <span className="text-sm font-medium">{preset.name}</span>
                  <span className="text-xs opacity-90">
                    {preset.displayUnit === WaterUnit.LITERS 
                      ? `${preset.amount / 1000} L`
                      : `${preset.amount} ml`
                    }
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                id="custom-amount"
                type="number"
                step="0.1"
                min="1"
                max="5000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="w-32">
              <label htmlFor="custom-unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="custom-unit"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value as WaterUnit)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value={WaterUnit.ML}>ml</option>
                <option value={WaterUnit.OZ}>oz</option>
                <option value={WaterUnit.CUPS}>cups</option>
                <option value={WaterUnit.LITERS}>L</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !customAmount}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Water
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
