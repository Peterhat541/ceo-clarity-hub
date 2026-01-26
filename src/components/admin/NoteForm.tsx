import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Visibility = "team" | "ceo" | "both";

interface NoteFormProps {
  onClose: () => void;
  onSave?: (content: string, visibility: Visibility) => void;
}

export function NoteForm({ onClose, onSave }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("team");

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    if (onSave) {
      onSave(content, visibility);
    }
    onClose();
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Contenido de la nota
        </label>
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Escribe la nota aquí..."
        />
      </div>
      
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
          {visibility === "ceo" && "Esta nota será visible para el CEO en su panel."}
          {visibility === "both" && "Esta nota será visible tanto para el equipo como para el CEO."}
        </p>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={!content.trim()}>
          Guardar nota
        </Button>
      </div>
    </div>
  );
}
