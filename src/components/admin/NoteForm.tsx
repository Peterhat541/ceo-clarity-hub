import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

type Visibility = "team" | "ceo" | "both";

interface NoteFormProps {
  onClose: () => void;
  onSave?: (data: {
    title: string;
    content: string;
    visibility: Visibility;
    targetDate: Date;
    clientName?: string;
  }) => void;
  clientName?: string;
  clients?: { name: string }[];
}

export function NoteForm({ onClose, onSave, clientName, clients = [] }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("team");
  const [selectedClient, setSelectedClient] = useState(clientName || "");
  const [targetDateStr, setTargetDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [targetTimeStr, setTargetTimeStr] = useState("09:00");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    
    const targetDate = new Date(`${targetDateStr}T${targetTimeStr}`);
    
    if (onSave) {
      onSave({
        title,
        content,
        visibility,
        targetDate,
        clientName: selectedClient || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Resumen breve de la nota..."
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Contenido
        </label>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Detalle de la nota..."
        />
      </div>

      {/* Client Selector */}
      {clients.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Cliente relacionado (opcional)
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin cliente específico</option>
            {clients.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Target Date/Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Para cuándo
          </label>
          <input
            type="date"
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Hora
          </label>
          <input
            type="time"
            value={targetTimeStr}
            onChange={(e) => setTargetTimeStr(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      
      {/* Visibility */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Visibilidad
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("team")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
              visibility === "team"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            Solo equipo
          </button>
          <button
            type="button"
            onClick={() => setVisibility("ceo")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
              visibility === "ceo"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            Solo CEO
          </button>
          <button
            type="button"
            onClick={() => setVisibility("both")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
              visibility === "both"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            Ambos
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {visibility === "team" && "Esta nota solo será visible para el equipo."}
          {visibility === "ceo" && "Esta nota aparecerá en el panel del CEO en la sección 'Notas del equipo'."}
          {visibility === "both" && "Esta nota será visible tanto para el equipo como para el CEO."}
        </p>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleSubmit} 
          disabled={!title.trim() || !content.trim()}
        >
          Guardar nota
        </Button>
      </div>
    </div>
  );
}
