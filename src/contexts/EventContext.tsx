import { createContext, useContext, useState, ReactNode } from "react";

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
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([
    // Sample event for demo
    {
      id: "demo-1",
      type: "meeting",
      title: "Reunión trimestral",
      clientName: "BlueSky Ventures",
      date: new Date(),
      time: "16:00",
      createdAt: new Date(),
      createdBy: "manual",
    },
  ]);

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

  return (
    <EventContext.Provider
      value={{ events, addEvent, getTodayEvents, getClientEvents, removeEvent }}
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
