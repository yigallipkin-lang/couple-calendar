'use client';

import { useState } from 'react';
import {
  useAuthContext,
  useCoupleContext,
  useEvents,
} from '@couple-calendar/shared';
import { Calendar, EventForm, EventDetail } from '@/components';
import { Plus } from 'lucide-react';
import type { Event, EventFormData } from '@couple-calendar/shared';

export default function CalendarPage() {
  const { user } = useAuthContext();
  const { couple, partner, myColor } = useCoupleContext();
  const { events, loading, error, createEvent, updateEvent, deleteEvent, clearError } = useEvents(
    couple?.id || null
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Please sign in to view calendar</p>
      </div>
    );
  }

  if (!couple || !partner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Please pair with your partner to view calendar</p>
      </div>
    );
  }

  const handleCreateEvent = async (data: EventFormData) => {
    if (!user.uid) return;

    setFormLoading(true);
    try {
      await createEvent(data, user.uid, myColor);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;

    setFormLoading(true);
    try {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400 animate-pulse">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-50">Calendar</h1>
            <p className="text-slate-400 mt-2">
              Shared calendar with {partner.displayName}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 flex justify-between items-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Calendar */}
        <Calendar
          events={events}
          onSelectDate={(date) => {
            // Could implement day view or auto-create event
            console.log('Selected date:', date);
          }}
          onSelectEvent={handleSelectEvent}
        />

        {/* Event list */}
        {events.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-50 mb-4">Upcoming Events</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events
                .filter((event) => {
                  if (!event.startTime) return true;
                  return new Date(event.startTime) >= new Date();
                })
                .slice(0, 6)
                .map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-50 truncate">
                          {event.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {event.allDay
                            ? 'All day'
                            : event.startTime
                              ? new Date(event.startTime).toLocaleDateString()
                              : 'No time'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">No events yet. Create one to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={handleCloseForm}
          isLoading={formLoading}
          color={myColor}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          partnerName={partner.displayName}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}
