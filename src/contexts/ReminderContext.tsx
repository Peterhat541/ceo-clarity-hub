import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [triggeredEventIds, setTriggeredEventIds] = useState<Set<string>>(() => {
    // Recuperar del localStorage para persistir entre recargas
    const saved = localStorage.getItem("triggeredEventIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Guardar triggeredEventIds en localStorage
  useEffect(() => {
    localStorage.setItem("triggeredEventIds", JSON.stringify([...triggeredEventIds]));
  }, [triggeredEventIds]);

  // Check for reminders directly from Supabase
  const checkReminders = useCallback(async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Fetch today's events from Supabase
      const { data: events, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          type,
          start_at,
          reminder_minutes,
          client_id,
          clients (name)
        `)
        .gte("start_at", todayStart.toISOString())
        .lte("start_at", todayEnd.toISOString());

      if (error) {
        console.error("Error fetching events for reminders:", error);
        return;
      }

      if (!events) return;

      const currentTimeMs = now.getTime();

      events.forEach((event) => {
        // Skip if already triggered
        if (triggeredEventIds.has(event.id)) return;

        const eventDate = new Date(event.start_at);
        const eventTimeMs = eventDate.getTime();
        
        // Default reminder is 15 minutes before
        const reminderMinutesBefore = event.reminder_minutes || 15;
        const reminderTimeMs = eventTimeMs - (reminderMinutesBefore * 60 * 1000);

        // Grace period: show reminder up to 5 minutes after event time
        const graceEndMs = eventTimeMs + (5 * 60 * 1000);

        // Check if it's time to show the reminder (from reminder time until 5 min after event)
        if (currentTimeMs >= reminderTimeMs && currentTimeMs <= graceEndMs) {
          const hours = eventDate.getHours().toString().padStart(2, "0");
          const minutes = eventDate.getMinutes().toString().padStart(2, "0");
          
          const newReminder: ActiveReminder = {
            id: `reminder-${event.id}-${Date.now()}`,
            eventId: event.id,
            eventTitle: event.title,
            clientName: event.clients?.name || "Sin cliente",
            eventTime: `${hours}:${minutes}`,
            triggeredAt: now,
            dismissed: false,
          };

          console.log("🔔 Triggering reminder for:", event.title, "at", `${hours}:${minutes}`);
          
          setActiveReminders((prev) => {
            // Avoid duplicates
            if (prev.some(r => r.eventId === event.id)) return prev;
            return [...prev, newReminder];
          });
          setTriggeredEventIds((prev) => new Set([...prev, event.id]));
        }
      });
    } catch (err) {
      console.error("Error checking reminders:", err);
    }
  }, [triggeredEventIds]);

  // Check immediately and every 10 seconds
  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [checkReminders]);

  // Also check when events are created
  useEffect(() => {
    const handleEventCreated = () => {
      console.log("Event created, checking reminders...");
      checkReminders();
    };

    window.addEventListener("prossium:eventCreated", handleEventCreated);
    return () => {
      window.removeEventListener("prossium:eventCreated", handleEventCreated);
    };
  }, [checkReminders]);

  // Clear old triggered IDs at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setTriggeredEventIds(new Set());
      localStorage.removeItem("triggeredEventIds");
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

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

  return (
    <ReminderContext.Provider
      value={{ activeReminders, dismissReminder, dismissAllReminders }}
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
