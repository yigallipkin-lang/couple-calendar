'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Event, EventFormData, ReminderType } from '@couple-calendar/shared';

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  color: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onClose,
  isLoading = false,
  color,
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [startTime, setStartTime] = useState<Date | null>(event?.startTime || null);
  const [endTime, setEndTime] = useState<Date | null>(event?.endTime || null);
  const [notes, setNotes] = useState(event?.notes || '');
  const [location, setLocation] = useState(event?.location || '');
  const [reminder, setReminder] = useState<ReminderType>(event?.reminder || 'none');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!allDay && !startTime) {
      setError('Start time is required for timed events');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        allDay,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        reminder,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-50">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 cursor-pointer"
              disabled={isLoading}
            />
            <label htmlFor="allDay" className="text-sm font-medium text-slate-300 cursor-pointer">
              All day event
            </label>
          </div>

          {/* Start Time */}
          {!allDay && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Time
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startTime?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value + 'T00:00:00');
                      setStartTime(date);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:border-sky-500 transition-colors"
                  disabled={isLoading}
                />
                <input
                  type="time"
                  value={startTime ? startTime.toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    if (e.target.value && startTime) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(startTime);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setStartTime(newDate);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:border-sky-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* End Time */}
          {!allDay && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Time (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endTime?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value + 'T00:00:00');
                      setEndTime(date);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:border-sky-500 transition-colors"
                  disabled={isLoading}
                />
                <input
                  type="time"
                  value={endTime ? endTime.toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    if (e.target.value && endTime) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(endTime);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setEndTime(newDate);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:border-sky-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or details"
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reminder
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as ReminderType)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:border-sky-500 transition-colors"
              disabled={isLoading}
            >
              <option value="none">No reminder</option>
              <option value="15min">15 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
              <option value="1week">1 week before</option>
            </select>
          </div>

          {/* Color indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-slate-400">Event color</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
