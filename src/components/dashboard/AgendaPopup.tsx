import { Phone, Users, Bell, X, Clock, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventContext, CalendarEvent } from "@/contexts/EventContext";
import { useAIChatContext } from "@/contexts/AIChatContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

function formatEventDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return "Hoy";
  if (isTomorrow) return "Mañana";
  
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface EventItemProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
  onAIClick: (event: CalendarEvent) => void;
}

function EventItem({ event, onDelete, onAIClick }: EventItemProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);
      
      if (error) throw error;
      
      onDelete(event.id);
      toast({
        title: "Evento eliminado",
        description: `"${event.title}" ha sido eliminado.`,
      });
    } catch (err) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento.",
        variant: "destructive",
      });
    }
  };

  const handleClick = () => {
    onAIClick(event);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
        <Icon className={cn("w-4 h-4", config.textColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {event.clientName !== "Sin cliente" ? event.clientName : config.label}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">{formatEventDate(event.date)}</p>
        <p className="text-sm font-medium text-foreground">{event.time}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
          title="Consultar con IA"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function AgendaPopup({ isOpen, onClose }: AgendaPopupProps) {
  const { events, refreshEvents } = useEventContext();
  const { setInput, setActiveClient } = useAIChatContext();

  if (!isOpen) return null;

  // Get all upcoming events (filter out past events by exact time, not just date)
  const now = new Date();
  
  // Filter events that haven't happened yet (with 5 min grace period)
  const graceMs = 5 * 60 * 1000; // 5 minutes grace period
  const upcomingEvents = events
    .filter((event) => {
      const eventTime = new Date(event.date).getTime();
      return eventTime >= (now.getTime() - graceMs);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const calls = upcomingEvents.filter((e) => e.type === "call");
  const meetings = upcomingEvents.filter((e) => e.type === "meeting");
  const reminders = upcomingEvents.filter((e) => e.type === "reminder");

  const handleDelete = (id: string) => {
    refreshEvents();
  };

  const handleAIClick = (event: CalendarEvent) => {
    // Build prefilled prompt
    const dateStr = formatEventDate(event.date);
    const hasClient = event.clientName && event.clientName !== "Sin cliente";
    
    let prompt = `Dame el contexto y próximos pasos para este evento: "${event.title}" programado para ${dateStr} a las ${event.time}.`;
    
    if (hasClient) {
      prompt += ` Cliente: ${event.clientName}. Incluye teléfono, email, último contacto y tareas pendientes si existen.`;
      setActiveClient({ id: event.clientId || null, name: event.clientName });
    } else {
      prompt += ` Este evento no tiene cliente asociado.`;
      setActiveClient({ id: null, name: null });
    }
    
    // Set input and close popup
    setInput(prompt);
    onClose();
    
    toast({
      title: "Consulta preparada",
      description: "Tu pregunta está lista en el chat de IA.",
    });
  };

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
              <h2 className="font-semibold text-foreground">Mi Agenda</h2>
              <p className="text-xs text-muted-foreground">
                {upcomingEvents.length} evento{upcomingEvents.length !== 1 ? "s" : ""} próximo{upcomingEvents.length !== 1 ? "s" : ""}
                {" · "}
                <span className="text-primary">Clic para consultar IA</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No tienes eventos programados</p>
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
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onDelete={handleDelete}
                        onAIClick={handleAIClick}
                      />
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
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onDelete={handleDelete}
                        onAIClick={handleAIClick}
                      />
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
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onDelete={handleDelete}
                        onAIClick={handleAIClick}
                      />
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
