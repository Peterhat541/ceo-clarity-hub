import { Phone, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReminderContext, ActiveReminder } from "@/contexts/ReminderContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ReminderAlertItemProps {
  reminder: ActiveReminder;
  onDismiss: () => void;
}

function calculateTimeRemaining(eventTime: string): { text: string; seconds: number } {
  const now = new Date();
  const [hours, minutes] = eventTime.split(":").map(Number);
  
  const eventDate = new Date();
  eventDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = eventDate.getTime() - now.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds <= 0) {
    return { text: "¡Ahora!", seconds: 0 };
  }
  
  if (diffMinutes < 1) {
    return { text: `En ${diffSeconds}s`, seconds: diffSeconds };
  }
  
  if (diffMinutes < 60) {
    const remainingSeconds = diffSeconds % 60;
    return { 
      text: `En ${diffMinutes}:${remainingSeconds.toString().padStart(2, "0")}`, 
      seconds: diffSeconds 
    };
  }
  
  const remainingMinutes = diffMinutes % 60;
  return { 
    text: `En ${diffHours}h ${remainingMinutes}min`, 
    seconds: diffSeconds 
  };
}

function ReminderAlertItem({ reminder, onDismiss }: ReminderAlertItemProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => 
    calculateTimeRemaining(reminder.eventTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(reminder.eventTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [reminder.eventTime]);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-status-red/20 border-2 border-status-red animate-fade-in",
        "shadow-lg shadow-status-red/20"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-status-red/30 flex items-center justify-center animate-pulse">
        <Phone className="w-6 h-6 text-status-red" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-status-red">
            Recordatorio
          </span>
          <Clock className="w-3 h-3 text-status-red" />
        </div>
        <p className="font-semibold text-foreground">
          {reminder.eventTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className={cn(
            "font-medium",
            timeRemaining.seconds < 300 && "text-status-red"
          )}>
            {timeRemaining.text}
          </span>
          {" · "}
          {reminder.eventTime}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-status-red/20"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ReminderAlert() {
  const { activeReminders, dismissReminder } = useReminderContext();

  const visibleReminders = activeReminders.filter((r) => !r.dismissed);

  if (visibleReminders.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      {visibleReminders.map((reminder) => (
        <ReminderAlertItem
          key={reminder.id}
          reminder={reminder}
          onDismiss={() => dismissReminder(reminder.id)}
        />
      ))}
    </div>
  );
}
