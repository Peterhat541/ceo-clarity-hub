import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEventContext } from "@/contexts/EventContext";

interface CreateReminderFromNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteTitle: string;
  noteContent: string;
  clientName?: string;
}

export function CreateReminderFromNoteModal({
  open,
  onOpenChange,
  noteTitle,
  noteContent,
  clientName,
}: CreateReminderFromNoteModalProps) {
  const { refreshEvents } = useEventContext();
  const [loading, setLoading] = useState(false);
  
  // Default to tomorrow at 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];
  
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");

  const handleSubmit = async () => {
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
        title: `📝 ${noteTitle}`,
        type: "reminder",
        start_at: startAt.toISOString(),
        reminder_minutes: 15,
        created_by: "Juan",
        notes: noteContent,
      });

      if (error) throw error;

      await refreshEvents();
      
      toast({
        title: "Recordatorio creado",
        description: `Se creó un recordatorio para ${new Date(startAt).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} a las ${time}.`,
      });
      
      onOpenChange(false);
    } catch (err) {
      console.error("Error creating reminder:", err);
      toast({
        title: "Error",
        description: "No se pudo crear el recordatorio.",
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
            <Bell className="w-5 h-5 text-amber-400" />
            Crear recordatorio desde nota
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-1">{noteTitle}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{noteContent}</p>
            {clientName && (
              <p className="text-xs text-primary mt-2">Cliente: {clientName}</p>
            )}
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
                min={new Date().toISOString().split("T")[0]}
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
            <Bell className="w-4 h-4" />
            {loading ? "Creando..." : "Crear recordatorio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
