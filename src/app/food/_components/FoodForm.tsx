'use client';

import { useState, useEffect } from 'react';
import { MealType, PortionUnit, FoodFormData, FoodEntry } from '@/lib/types/food';
import { MEAL_TYPE_LABELS, PORTION_UNIT_LABELS } from '@/lib/data/commonFoods';
import { useAuth } from '@/lib/contexts/AuthContext';
import foodService from '@/lib/services/foodService';
import { Save, X, Search } from 'lucide-react';
import FoodSearchAutocomplete from './FoodSearchAutocomplete';

interface FoodFormProps {
  onFoodAdded: (food: FoodEntry) => void;
  onCancel: () => void;
  editingEntry?: FoodEntry | null;
}

export default function FoodForm({ onFoodAdded, onCancel, editingEntry }: FoodFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    mealType: MealType.BREAKFAST,
    portionSize: 1,
    portionUnit: PortionUnit.SERVINGS,
    calories: 0,
    timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        name: editingEntry.name,
        mealType: editingEntry.mealType,
        portionSize: editingEntry.portionSize,
        portionUnit: editingEntry.portionUnit,
        calories: editingEntry.calories,
        protein: editingEntry.macros?.protein,
        carbs: editingEntry.macros?.carbs,
        fats: editingEntry.macros?.fats,
        timestamp: new Date(editingEntry.timestamp).toISOString().slice(0, 16),
        notes: editingEntry.notes || ''
      });
    }
  }, [editingEntry]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }

    if (formData.calories < 0) {
      newErrors.calories = 'Calories must be a positive number';
    }

    if (formData.portionSize <= 0) {
      newErrors.portionSize = 'Portion size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      let food: FoodEntry;
      
      if (editingEntry) {
        food = await foodService.updateFoodEntry(editingEntry.id, formData);
      } else {
        food = await foodService.createFoodEntry(formData, user.id);
      }

      onFoodAdded(food);

      // Reset form
      setFormData({
        name: '',
        mealType: MealType.BREAKFAST,
        portionSize: 1,
        portionUnit: PortionUnit.SERVINGS,
        calories: 0,
        timestamp: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to save food entry:', error);
      setErrors({ submit: 'Failed to save food entry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFoodSelect = (food: any) => {
    setFormData(prev => ({
      ...prev,
      name: food.name,
      portionSize: food.defaultPortionSize,
      portionUnit: food.defaultPortionUnit,
      calories: food.calories,
      protein: food.macros.protein,
      carbs: food.macros.carbs,
      fats: food.macros.fats
    }));
    setShowSearch(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingEntry ? 'Edit Food Entry' : 'Add Food Entry'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Name with Search */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Food Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={() => setShowSearch(true)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Grilled Chicken"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {showSearch && (
            <FoodSearchAutocomplete
              query={formData.name}
              onSelect={handleFoodSelect}
              onClose={() => setShowSearch(false)}
            />
          )}
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Meal Type */}
        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Type *
          </label>
          <select
            id="mealType"
            value={formData.mealType}
            onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Portion Size and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="portionSize" className="block text-sm font-medium text-gray-700 mb-1">
              Portion Size *
            </label>
            <input
              type="number"
              id="portionSize"
              value={formData.portionSize}
              onChange={(e) => setFormData({ ...formData, portionSize: parseFloat(e.target.value) || 0 })}
              step="0.1"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.portionSize ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.portionSize && (
              <p className="mt-1 text-sm text-red-600">{errors.portionSize}</p>
            )}
          </div>

          <div>
            <label htmlFor="portionUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              id="portionUnit"
              value={formData.portionUnit}
              onChange={(e) => setFormData({ ...formData, portionUnit: e.target.value as PortionUnit })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Object.entries(PORTION_UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calories */}
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
            Calories *
          </label>
          <input
            type="number"
            id="calories"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
            min="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.calories ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.calories && (
            <p className="mt-1 text-sm text-red-600">{errors.calories}</p>
          )}
        </div>

        {/* Macronutrients (Optional) */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Macronutrients (Optional)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="protein" className="block text-sm text-gray-600 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                value={formData.protein || ''}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || undefined })}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm text-gray-600 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                value={formData.carbs || ''}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || undefined })}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="fats" className="block text-sm text-gray-600 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                id="fats"
                value={formData.fats || ''}
                onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || undefined })}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Time */}
        <div>
          <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
            Time *
          </label>
          <input
            type="datetime-local"
            id="timestamp"
            value={formData.timestamp}
            onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : (editingEntry ? 'Update' : 'Save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
