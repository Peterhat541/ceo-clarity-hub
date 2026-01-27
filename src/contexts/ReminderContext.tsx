import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useEventContext, CalendarEvent } from "./EventContext";

export interface ActiveReminder {
  id: string;
  eventId: string;
  eventTitle: string;
  clientName: string;
  eventTime: string;
  triggeredAt: Date;
  dismissed: boolean;
}

interface ReminderContextType {
  activeReminders: ActiveReminder[];
  dismissReminder: (id: string) => void;
  dismissAllReminders: () => void;
  triggerTestReminder: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { events } = useEventContext();
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [triggeredEventIds, setTriggeredEventIds] = useState<Set<string>>(new Set());

  // Check for reminders every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

      events.forEach((event) => {
        // Skip if already triggered
        if (triggeredEventIds.has(event.id)) return;

        // Check if event is today
        const eventDate = new Date(event.date);
        const isToday =
          eventDate.getDate() === now.getDate() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear();

        if (!isToday) return;

        // Calculate event time in minutes
        const [eventHours, eventMinutes] = event.time.split(":").map(Number);
        const eventTimeMinutes = eventHours * 60 + eventMinutes;

        // Default reminder is 15 minutes before
        const reminderMinutesBefore = event.reminder?.minutesBefore || 15;
        const reminderTimeMinutes = eventTimeMinutes - reminderMinutesBefore;

        // Check if it's time to show the reminder (within 1 minute window)
        if (currentTimeMinutes >= reminderTimeMinutes && currentTimeMinutes <= reminderTimeMinutes + 1) {
          // Trigger reminder
          const newReminder: ActiveReminder = {
            id: `reminder-${event.id}-${Date.now()}`,
            eventId: event.id,
            eventTitle: event.title,
            clientName: event.clientName,
            eventTime: event.time,
            triggeredAt: now,
            dismissed: false,
          };

          setActiveReminders((prev) => [...prev, newReminder]);
          setTriggeredEventIds((prev) => new Set([...prev, event.id]));
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [events, triggeredEventIds]);

  const dismissReminder = (id: string) => {
    setActiveReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
    // Remove from list after animation
    setTimeout(() => {
      setActiveReminders((prev) => prev.filter((r) => r.id !== id));
    }, 300);
  };

  const dismissAllReminders = () => {
    setActiveReminders([]);
  };

  const triggerTestReminder = () => {
    const now = new Date();
    const testReminder: ActiveReminder = {
      id: `test-reminder-${Date.now()}`,
      eventId: "test-event",
      eventTitle: "Reunión de prueba con cliente",
      clientName: "Test Client",
      eventTime: `${now.getHours().toString().padStart(2, "0")}:${(now.getMinutes() + 15).toString().padStart(2, "0")}`,
      triggeredAt: now,
      dismissed: false,
    };
    setActiveReminders((prev) => [...prev, testReminder]);
  };

  return (
    <ReminderContext.Provider
      value={{ activeReminders, dismissReminder, dismissAllReminders, triggerTestReminder }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminderContext() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error("useReminderContext must be used within a ReminderProvider");
  }
  return context;
}
