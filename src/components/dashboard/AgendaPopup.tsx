import { Phone, Users, Bell, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventContext, CalendarEvent } from "@/contexts/EventContext";
import { cn } from "@/lib/utils";

interface AgendaPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventTypeConfig = {
  call: {
    icon: Phone,
    label: "Llamada",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
  },
  meeting: {
    icon: Users,
    label: "Reunión",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
  },
  reminder: {
    icon: Bell,
    label: "Recordatorio",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
  },
};

function EventItem({ event }: { event: CalendarEvent }) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("w-4 h-4", config.textColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">{event.clientName}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{event.time}</p>
        {event.reminder && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Bell className="w-3 h-3" />
            {event.reminder.time}
          </p>
        )}
      </div>
    </div>
  );
}

export function AgendaPopup({ isOpen, onClose }: AgendaPopupProps) {
  const { getTodayEvents } = useEventContext();
  const todayEvents = getTodayEvents();

  if (!isOpen) return null;

  const calls = todayEvents.filter((e) => e.type === "call");
  const meetings = todayEvents.filter((e) => e.type === "meeting");
  const reminders = todayEvents.filter((e) => e.type === "reminder");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Popup */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Agenda de hoy</h2>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No tienes eventos para hoy</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pídele a la IA que te agende algo
              </p>
            </div>
          ) : (
            <>
              {/* Calls */}
              {calls.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Llamadas ({calls.length})
                  </h3>
                  <div className="space-y-2">
                    {calls.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Meetings */}
              {meetings.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Reuniones ({meetings.length})
                  </h3>
                  <div className="space-y-2">
                    {meetings.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders */}
              {reminders.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Recordatorios ({reminders.length})
                  </h3>
                  <div className="space-y-2">
                    {reminders.map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
