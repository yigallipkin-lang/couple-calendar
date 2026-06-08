'use client';

import { useState } from 'react';
import { formatDateShort, formatTime } from '@couple-calendar/shared';
import { X, Edit2, Trash2, MapPin, Clock, AlertCircle } from 'lucide-react';
import type { Event } from '@couple-calendar/shared';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => Promise<void>;
  partnerName: string;
  isLoading?: boolean;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  partnerName,
  isLoading = false,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await onDelete(event.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  const reminderLabel: Record<string, string> = {
    none: 'No reminder',
    '15min': '15 minutes before',
    '1hour': '1 hour before',
    '1day': '1 day before',
    '1week': '1 week before',
  };

  const completedChecklist = event.checklist?.filter((item) => item.done).length || 0;
  const totalChecklist = event.checklist?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-50">{event.title}</h2>
            <p className="text-sm text-slate-400 mt-1">by {partnerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded p-3 mb-4 text-red-400 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Color indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: event.color }}
          />
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            {event.color}
          </span>
        </div>

        {/* Date/Time */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 space-y-3">
          {event.allDay ? (
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-400">All day event</p>
                <p className="text-slate-200 font-medium">
                  {formatDateShort(new Date(event.startTime || new Date()))}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-400">
                  {formatDateShort(new Date(event.startTime || new Date()))}
                </p>
                <p className="text-slate-200 font-medium">
                  {formatTime(new Date(event.startTime || new Date()))}
                  {event.endTime && (
                    <>
                      {' - '}
                      {formatTime(new Date(event.endTime))}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 flex gap-3">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Location</p>
              <p className="text-slate-200">{event.location}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {event.notes && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-400 mb-2">Notes</p>
            <p className="text-slate-200 whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}

        {/* Reminder */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-400 mb-1">Reminder</p>
          <p className="text-slate-200">{reminderLabel[event.reminder]}</p>
        </div>

        {/* Checklist */}
        {event.checklist && event.checklist.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-400 mb-3">
              Checklist ({completedChecklist}/{totalChecklist})
            </p>
            <div className="space-y-2">
              {event.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    readOnly
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-default"
                  />
                  <span
                    className={`text-sm ${
                      item.done ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={deleting || isLoading}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={deleting || isLoading}
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          disabled={deleting || isLoading}
        >
          Close
        </button>
      </div>
    </div>
  );
};
