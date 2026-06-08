'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import type { Event, EventFormData } from '../types';

export const useEvents = (coupleId: string | null) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    try {
      const database = getFirestore();
      setDb(database);
    } catch (err: any) {
      setError('Firebase not initialized');
    }
  }, []);

  // Real-time listener for events
  useEffect(() => {
    if (!coupleId || !db) {
      setEvents([]);
      if (!db) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventsRef = collection(db, 'events', coupleId, 'items');
      const q = query(eventsRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newEvents: Event[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            newEvents.push({
              id: doc.id,
              ...data,
              startTime: data.startTime ? new Date(data.startTime) : null,
              endTime: data.endTime ? new Date(data.endTime) : null,
              createdAt: new Date(data.createdAt),
              updatedAt: new Date(data.updatedAt),
            } as Event);
          });
          // Sort events by start time
          newEvents.sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });
          setEvents(newEvents);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return () => {};
    }
  }, [coupleId, db, setEvents]);

  const createEvent = useCallback(
    async (data: EventFormData, userId: string, color: string) => {
      if (!coupleId) {
        setError('No couple ID available');
        return;
      }

      try {
        const eventsRef = collection(db, 'events', coupleId, 'items');
        const docRef = await addDoc(eventsRef, {
          ...data,
          color,
          coupleId,
          createdBy: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to create event';
        setError(errorMsg);
        throw err;
      }
    },
    [coupleId, db]
  );

  const updateEvent = useCallback(
    async (eventId: string, data: Partial<EventFormData>) => {
      if (!coupleId) {
        setError('No couple ID available');
        return;
      }

      try {
        const eventRef = doc(db, 'events', coupleId, 'items', eventId);
        await updateDoc(eventRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update event';
        setError(errorMsg);
        throw err;
      }
    },
    [coupleId, db]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!coupleId) {
        setError('No couple ID available');
        return;
      }

      try {
        const eventRef = doc(db, 'events', coupleId, 'items', eventId);
        await deleteDoc(eventRef);
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to delete event';
        setError(errorMsg);
        throw err;
      }
    },
    [coupleId, db]
  );

  const toggleChecklistItem = useCallback(
    async (eventId: string, itemId: string, done: boolean) => {
      if (!coupleId) {
        setError('No couple ID available');
        return;
      }

      try {
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          setError('Event not found');
          return;
        }

        const updatedChecklist = event.checklist?.map((item) =>
          item.id === itemId ? { ...item, done } : item
        );

        await updateEvent(eventId, { checklist: updatedChecklist });
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update checklist';
        setError(errorMsg);
        throw err;
      }
    },
    [coupleId, events, updateEvent]
  );

  const getEventsByDate = useCallback(
    (year: number, month: number, day: number): Event[] => {
      const targetDate = new Date(year, month, day);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return events.filter((event) => {
        if (event.allDay) {
          return true;
        }
        if (!event.startTime) return false;
        const eventStart = new Date(event.startTime);
        const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
        return eventStart <= endOfDay && eventEnd >= startOfDay;
      });
    },
    [events]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleChecklistItem,
    getEventsByDate,
    clearError,
  };
};
