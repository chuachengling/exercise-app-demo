'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types/auth';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Users, 
  Ruler, 
  Weight, 
  Activity, 
  Edit, 
  Save, 
  X,
  Settings,
  Bell,
  Shield,
  Palette,
  Target
} from 'lucide-react';

interface EditableFieldProps {
  label: string;
  value: string | number | Date | undefined;
  type?: 'text' | 'email' | 'date' | 'number' | 'select';
  options?: { value: string; label: string }[];
  onChange: (value: string | number | Date) => void;
  icon?: React.ReactNode;
  suffix?: string;
  placeholder?: string;
}

function EditableField({ 
  label, 
  value, 
  type = 'text', 
  options, 
  onChange, 
  icon, 
  suffix,
  placeholder 
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');

  useEffect(() => {
    if (value instanceof Date) {
      setEditValue(value.toISOString().split('T')[0]);
    } else {
      setEditValue(value?.toString() || '');
    }
  }, [value]);

  const handleSave = () => {
    if (type === 'number') {
      onChange(parseFloat(editValue) || 0);
    } else if (type === 'date') {
      onChange(new Date(editValue));
    } else {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (value instanceof Date) {
      setEditValue(value.toISOString().split('T')[0]);
    } else {
      setEditValue(value?.toString() || '');
    }
    setIsEditing(false);
  };

  const displayValue = value instanceof Date 
    ? value.toLocaleDateString() 
    : (value || 'Not set');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                {type === 'select' && options ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-gray-900">
                {displayValue}{suffix && value ? ` ${suffix}` : ''}
              </p>
            )}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}

function PreferenceToggle({ label, description, enabled, onChange, icon }: PreferenceToggleProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div>
            <h4 className="text-sm font-medium text-gray-900">{label}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onChange(!enabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFieldUpdate = async (field: keyof User, value: string | number | Date) => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await updateProfile({ [field]: value });
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceUpdate = async (path: string, value: any) => {
    if (!user) return;

    setSaving(true);
    try {
      // Create a deep copy of preferences
      const newPreferences = JSON.parse(JSON.stringify(user.preferences));
      const keys = path.split('.');
      let current: any = newPreferences;
      
      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the value
      current[keys[keys.length - 1]] = value;

      const response = await updateProfile({ preferences: newPreferences });
      if (response.success) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update preferences' });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const activityLevelOptions = [
    { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very-active', label: 'Very Active (2x/day or intense exercise)' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  const weightUnitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lbs', label: 'Pounds (lbs)' }
  ];

  const heightUnitOptions = [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'ft', label: 'Feet (ft)' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Member since {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {message && (
          <div className={`
            mb-6 p-4 rounded-lg border
            ${message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
            }
          `}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="First Name"
                    value={user.firstName}
                    onChange={(value) => handleFieldUpdate('firstName', value)}
                    icon={<UserIcon className="w-5 h-5" />}
                    placeholder="Enter first name"
                  />
                  <EditableField
                    label="Last Name"
                    value={user.lastName}
                    onChange={(value) => handleFieldUpdate('lastName', value)}
                    icon={<UserIcon className="w-5 h-5" />}
                    placeholder="Enter last name"
                  />
                </div>
                
                <EditableField
                  label="Email Address"
                  value={user.email}
                  type="email"
                  onChange={(value) => handleFieldUpdate('email', value)}
                  icon={<Mail className="w-5 h-5" />}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Date of Birth"
                    value={user.dateOfBirth ? (user.dateOfBirth instanceof Date ? user.dateOfBirth : new Date(user.dateOfBirth)) : undefined}
                    type="date"
                    onChange={(value) => handleFieldUpdate('dateOfBirth', new Date(value as string))}
                    icon={<Calendar className="w-5 h-5" />}
                  />
                  <EditableField
                    label="Gender"
                    value={user.gender}
                    type="select"
                    options={genderOptions}
                    onChange={(value) => handleFieldUpdate('gender', value)}
                    icon={<Users className="w-5 h-5" />}
                  />
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Health Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Height"
                    value={user.height}
                    type="number"
                    onChange={(value) => handleFieldUpdate('height', value)}
                    icon={<Ruler className="w-5 h-5" />}
                    suffix={user.preferences.units.height}
                    placeholder="Enter height"
                  />
                  <EditableField
                    label="Weight"
                    value={user.weight}
                    type="number"
                    onChange={(value) => handleFieldUpdate('weight', value)}
                    icon={<Weight className="w-5 h-5" />}
                    suffix={user.preferences.units.weight}
                    placeholder="Enter weight"
                  />
                </div>
                
                <EditableField
                  label="Activity Level"
                  value={user.activityLevel}
                  type="select"
                  options={activityLevelOptions}
                  onChange={(value) => handleFieldUpdate('activityLevel', value)}
                  icon={<Activity className="w-5 h-5" />}
                />

                {user.healthGoals && user.healthGoals.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-700">Health Goals</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.healthGoals.map((goal, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Preferences
            </h2>
            
            <div className="space-y-6">
              {/* Notifications */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  <PreferenceToggle
                    label="Email Notifications"
                    description="Receive health tips and updates via email"
                    enabled={user.preferences.notifications.email}
                    onChange={(value) => handlePreferenceUpdate('notifications.email', value)}
                  />
                  <PreferenceToggle
                    label="Push Notifications"
                    description="Get workout reminders and achievements"
                    enabled={user.preferences.notifications.push}
                    onChange={(value) => handlePreferenceUpdate('notifications.push', value)}
                  />
                  <PreferenceToggle
                    label="Exercise Reminders"
                    description="Daily reminders to stay active"
                    enabled={user.preferences.notifications.reminders}
                    onChange={(value) => handlePreferenceUpdate('notifications.reminders', value)}
                  />
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </h3>
                <div className="space-y-3">
                  <PreferenceToggle
                    label="Data Sharing"
                    description="Share anonymous data to improve the app"
                    enabled={user.preferences.privacy.dataSharing}
                    onChange={(value) => handlePreferenceUpdate('privacy.dataSharing', value)}
                  />
                </div>
              </div>

              {/* Units */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Units</h3>
                <div className="space-y-3">
                  <EditableField
                    label="Weight Unit"
                    value={user.preferences.units.weight}
                    type="select"
                    options={weightUnitOptions}
                    onChange={(value) => handlePreferenceUpdate('units.weight', value)}
                  />
                  <EditableField
                    label="Height Unit"
                    value={user.preferences.units.height}
                    type="select"
                    options={heightUnitOptions}
                    onChange={(value) => handlePreferenceUpdate('units.height', value)}
                  />
                </div>
              </div>

              {/* Theme */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Appearance
                </h3>
                <EditableField
                  label="Theme"
                  value={user.preferences.theme}
                  type="select"
                  options={themeOptions}
                  onChange={(value) => handlePreferenceUpdate('theme', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}