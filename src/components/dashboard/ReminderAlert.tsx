import { Phone, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReminderContext, ActiveReminder } from "@/contexts/ReminderContext";
import { cn } from "@/lib/utils";

interface ReminderAlertItemProps {
  reminder: ActiveReminder;
  onDismiss: () => void;
}

function ReminderAlertItem({ reminder, onDismiss }: ReminderAlertItemProps) {
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
          En 15 minutos · {reminder.eventTime}
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
