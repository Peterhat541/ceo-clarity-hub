import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Users, Bell, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEventContext } from "@/contexts/EventContext";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

type EventType = "call" | "meeting" | "reminder";

const eventTypeOptions: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: "call", label: "Llamada", icon: <Phone className="w-4 h-4" /> },
  { value: "meeting", label: "Reunión", icon: <Users className="w-4 h-4" /> },
  { value: "reminder", label: "Recordatorio", icon: <Bell className="w-4 h-4" /> },
];

export function CreateEventModal({ open, onOpenChange, defaultDate }: CreateEventModalProps) {
  const { refreshEvents } = useEventContext();
  const [loading, setLoading] = useState(false);

  const defaultDateStr = defaultDate
    ? defaultDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("reminder");
  const [date, setDate] = useState(defaultDateStr);
  const [time, setTime] = useState("10:00");

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un título.",
        variant: "destructive",
      });
      return;
    }

    if (!date || !time) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const startAt = new Date(`${date}T${time}:00`);

      const { error } = await supabase.from("events").insert({
        title,
        type,
        start_at: startAt.toISOString(),
        reminder_minutes: 15,
        created_by: "Juan",
      });

      if (error) throw error;

      await refreshEvents();
      window.dispatchEvent(new CustomEvent("prossium:eventCreated"));

      toast({
        title: "Evento creado",
        description: `Se creó "${title}" para ${new Date(startAt).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} a las ${time}.`,
      });

      // Reset form
      setTitle("");
      setType("reminder");
      setTime("10:00");
      onOpenChange(false);
    } catch (err) {
      console.error("Error creating event:", err);
      toast({
        title: "Error",
        description: "No se pudo crear el evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Crear nuevo evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Llamar a cliente, Reunión de equipo..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de evento</Label>
            <Select value={type} onValueChange={(v) => setType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Plus className="w-4 h-4" />
            {loading ? "Creando..." : "Crear evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
