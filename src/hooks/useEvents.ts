import { useEffect, useMemo, useState } from 'react';
import { initialEvents, type EventItem } from '@/data/events';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'events_v1';
const REG_KEY = 'event_registrations_v1';

type Registration = {
  id: string; // registration id
  eventId: string;
  userId: string | null; // can be null if not logged in
  name: string;
  email: string;
  studentId?: string;
  createdAt: string; // ISO
};

function loadEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialEvents;
    }
    const parsed = JSON.parse(raw) as EventItem[];
    // Merge by id to ensure seeded events are available if missing
    const map = new Map<string, EventItem>();
    initialEvents.forEach(e => map.set(e.id, e));
    parsed.forEach(e => map.set(e.id, e));
    const result = Array.from(map.values());
    return result;
  } catch (error) {
    console.error('Error loading events from localStorage:', error);
    return initialEvents;
  }
}

function saveEvents(events: EventItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function loadRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(REG_KEY);
    return raw ? (JSON.parse(raw) as Registration[]) : [];
  } catch {
    return [];
  }
}

function saveRegistrations(rows: Registration[]) {
  localStorage.setItem(REG_KEY, JSON.stringify(rows));
}

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  }, []);

  const addEvent = (payload: Omit<EventItem, 'id'>) => {
    const id = `${payload.category}-${Math.random().toString(36).slice(2, 9)}`;
    const next = [{ ...payload, id }, ...events];
    setEvents(next);
    saveEvents(next);
    return id;
  };

  const updateEvent = (id: string, changes: Partial<EventItem>) => {
    const next = events.map(e => (e.id === id ? { ...e, ...changes } : e));
    setEvents(next);
    saveEvents(next);
  };

  const removeEvent = (id: string) => {
    const next = events.filter(e => e.id !== id);
    setEvents(next);
    saveEvents(next);
  };

  const byCategory = useMemo(
    () => ({
      academic: events.filter(e => e.category === 'academic'),
      co_curricular: events.filter(e => e.category === 'co_curricular'),
      outside_university: events.filter(
        e => e.category === 'outside_university'
      ),
    }),
    [events]
  );

  const getById = (id: string) => {
    const found = events.find(e => e.id === id) || null;
    return found;
  };

  return { events, byCategory, addEvent, updateEvent, removeEvent, getById };
}

export function useEventRegistration(eventId: string | null) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Registration[]>([]);

  useEffect(() => {
    setRows(loadRegistrations());
  }, []);

  const myRegistration = useMemo(() => {
    if (!eventId) return null;
    if (!user) return null;
    return (
      rows.find(r => r.eventId === eventId && r.userId === user.id) || null
    );
  }, [rows, user, eventId]);

  const register = (data: {
    name: string;
    email: string;
    studentId?: string;
  }) => {
    if (!eventId) return { error: 'Missing event' };
    const reg: Registration = {
      id: `r_${Math.random().toString(36).slice(2, 10)}`,
      eventId,
      userId: user?.id || null,
      name: data.name,
      email: data.email,
      studentId: data.studentId,
      createdAt: new Date().toISOString(),
    };
    const next = [reg, ...rows];
    setRows(next);
    saveRegistrations(next);
    return { error: null, registrationId: reg.id };
  };

  return { rows, myRegistration, register };
}
