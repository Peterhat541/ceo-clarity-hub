import { useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Users, Bell, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventContext, CalendarEvent } from "@/contexts/EventContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventTypeConfig = {
  call: {
    icon: Phone,
    label: "Llamada",
    bgColor: "bg-blue-500",
    dotColor: "bg-blue-500",
  },
  meeting: {
    icon: Users,
    label: "Reunión",
    bgColor: "bg-purple-500",
    dotColor: "bg-purple-500",
  },
  reminder: {
    icon: Bell,
    label: "Recordatorio",
    bgColor: "bg-amber-500",
    dotColor: "bg-amber-500",
  },
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = firstDay.getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Add days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the grid (6 rows x 7 days = 42)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
}

export function CalendarView({ isOpen, onClose }: CalendarViewProps) {
  const { events, refreshEvents } = useEventContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(year, month);
  const today = new Date();

  const monthName = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      refreshEvents();
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado correctamente.",
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

  const selectedDateEvents = selectedDate ? getEventsForDate(events, selectedDate) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground capitalize min-w-[180px] text-center">
              {monthName}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
              Hoy
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Llamada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Reunión</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Recordatorio</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Calendar Grid */}
          <div className="flex-1 p-4 overflow-auto">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth = day.getMonth() === month;
                const isToday = day.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const dayEvents = getEventsForDate(events, day);

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-all relative",
                      isCurrentMonth
                        ? "hover:bg-secondary"
                        : "text-muted-foreground/50 hover:bg-secondary/50",
                      isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      isSelected && "bg-primary/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary font-bold"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {/* Event dots */}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              eventTypeConfig[event.type].dotColor
                            )}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[8px] text-muted-foreground ml-0.5">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Events Panel */}
          <div className="w-72 border-l border-border p-4 overflow-auto bg-secondary/20">
            {selectedDate ? (
              <>
                <h3 className="font-semibold text-foreground mb-3">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay eventos para este día
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((event) => {
                        const config = eventTypeConfig[event.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg bg-card border border-border group hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  config.bgColor + "/20"
                                )}
                              >
                                <Icon
                                  className={cn("w-4 h-4", config.bgColor.replace("bg-", "text-"))}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {event.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {event.time} · {event.clientName}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Selecciona un día para ver sus eventos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
