import { useState } from "react";
import { X, Send, User, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SendNotePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendNotePopup({ isOpen, onClose }: SendNotePopupProps) {
  const [content, setContent] = useState("");
  const [targetEmployee, setTargetEmployee] = useState("");
  const [clientName, setClientName] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      // Try to find client by name if provided
      let clientId: string | null = null;
      if (clientName.trim()) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .ilike("name", `%${clientName.trim()}%`)
          .limit(1)
          .maybeSingle();
        
        if (clientData) {
          clientId = clientData.id;
        }
      }

      // Insert note into Supabase
      const { error } = await supabase
        .from("notes")
        .insert({
          text: content.trim(),
          visible_to: "team",
          target_employee: targetEmployee.trim() || null,
          created_by: "Juan",
          status: "pending",
          client_id: clientId
        });

      if (error) throw error;

      // Emit event for notification bell refresh
      window.dispatchEvent(new CustomEvent("prossium:noteCreated"));

      toast({
        title: "Nota enviada",
        description: targetEmployee 
          ? `Tu nota para ${targetEmployee} ha sido enviada al equipo.`
          : "Tu nota ha sido enviada al equipo.",
      });

      // Reset form
      setContent("");
      setTargetEmployee("");
      setClientName("");
      onClose();
    } catch (err) {
      console.error("Error sending note:", err);
      toast({
        title: "Error",
        description: "No se pudo enviar la nota. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Popup */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Enviar nota al equipo</h2>
              <p className="text-xs text-muted-foreground">
                Esta nota aparecerá en el panel de gestión
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Employee target (optional) */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Para (opcional)
            </Label>
            <Input
              id="employee"
              placeholder="Ej: María, Luis, Marta..."
              value={targetEmployee}
              onChange={(e) => setTargetEmployee(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Client reference (optional) */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Cliente relacionado (opcional)
            </Label>
            <Input
              id="client"
              placeholder="Ej: Chalet Familia López-Durán..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Note content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-foreground">
              Mensaje *
            </Label>
            <Textarea
              id="content"
              placeholder="Ej: Mañana llama al cliente para preguntar a qué hora puede tener una reunión conmigo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-secondary border-border min-h-[120px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!content.trim() || sending} className="gap-2">
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? "Enviando..." : "Enviar nota"}
          </Button>
        </div>
      </div>
    </div>
  );
}
