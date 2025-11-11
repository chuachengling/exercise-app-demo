'use client';

import { useState } from 'react';
import { Trash2, Clock, Droplet } from 'lucide-react';
import { WaterEntry, WaterUnit } from '@/lib/types/water';
import { formatWaterAmount } from '@/lib/services/waterService';
import { format } from 'date-fns';

interface WaterEntryCardProps {
  entry: WaterEntry;
  onDelete: (id: string) => Promise<void>;
  preferredUnit?: WaterUnit;
}

export default function WaterEntryCard({ 
  entry, 
  onDelete,
  preferredUnit = WaterUnit.ML 
}: WaterEntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const timeString = format(new Date(entry.timestamp), 'h:mm a');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon and Details */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Droplet className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold text-gray-900">
                {formatWaterAmount(entry.amount, preferredUnit)}
              </span>
              {entry.presetType && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  Preset
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeString}</span>
            </div>
            
            {entry.notes && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {entry.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right: Delete Button */}
        <div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete entry"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
