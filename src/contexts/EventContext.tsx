import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  type: "call" | "meeting" | "reminder";
  title: string;
  clientName: string;
  date: Date;
  time: string;
  reminder?: {
    time: string;
    minutesBefore: number;
  };
  createdAt: Date;
  createdBy: "ai" | "manual";
}

interface EventContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id" | "createdAt">) => CalendarEvent;
  getTodayEvents: () => CalendarEvent[];
  getClientEvents: (clientName: string) => CalendarEvent[];
  removeEvent: (id: string) => void;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          type,
          start_at,
          reminder_minutes,
          created_at,
          created_by,
          client_id,
          clients (name)
        `)
        .order("start_at", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      if (data) {
        const mappedEvents: CalendarEvent[] = data.map((event: any) => {
          const startAt = new Date(event.start_at);
          const hours = startAt.getHours().toString().padStart(2, "0");
          const minutes = startAt.getMinutes().toString().padStart(2, "0");
          
          return {
            id: event.id,
            type: event.type as "call" | "meeting" | "reminder",
            title: event.title,
            clientName: event.clients?.name || "Sin cliente",
            date: startAt,
            time: `${hours}:${minutes}`,
            reminder: event.reminder_minutes ? {
              time: `${event.reminder_minutes} min antes`,
              minutesBefore: event.reminder_minutes,
            } : undefined,
            createdAt: new Date(event.created_at),
            createdBy: event.created_by === "AI" ? "ai" : "manual",
          };
        });
        
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error("Error in fetchEvents:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Listen for custom event from AI chat
  useEffect(() => {
    const handleEventCreated = () => {
      console.log("Event created by AI, refreshing events...");
      fetchEvents();
    };

    window.addEventListener("processia:eventCreated", handleEventCreated);
    return () => {
      window.removeEventListener("processia:eventCreated", handleEventCreated);
    };
  }, [fetchEvents]);

  const addEvent = (eventData: Omit<CalendarEvent, "id" | "createdAt">): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    }).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getClientEvents = (clientName: string) => {
    return events.filter(
      (event) => event.clientName.toLowerCase() === clientName.toLowerCase()
    );
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  return (
    <EventContext.Provider
      value={{ events, addEvent, getTodayEvents, getClientEvents, removeEvent, refreshEvents }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}
